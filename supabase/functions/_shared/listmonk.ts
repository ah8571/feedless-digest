const managedTopicLists: Record<string, string> = {
  "ai-engineering": "Feedfree AI",
  "open-source-intrigues": "Feedfree Open Source",
  "crypto-investing": "Feedfree Crypto",
  "security": "Feedfree Security",
  "compliance": "Feedfree Compliance",
  "early-founder-bootstrapping": "Feedfree bootstrapping",
  "lead-generation": "Feedfree Lead Gen",
  seo: "Feedfree SEO",
  "cold-outreach-marketing": "Feedfree Cold Outreach",
  "social-media-marketing": "Feedfree Social Media",
};

type ListmonkList = {
  id: number;
  name: string;
};

type ListmonkSubscriberList = ListmonkList & {
  subscription_status?: string;
};

type ListmonkSubscriber = {
  id: number;
  email: string;
  lists?: ListmonkSubscriberList[];
};

type ReconcileListmonkSubscriberInput = {
  email: string;
  topics: string[];
  source?: string | null;
  unsubscribeToken?: string | null;
  subscribed: boolean;
};

type ListmonkSyncResult =
  | { ok: true; synced: boolean; reason?: string }
  | { ok: false; synced: false; reason: string };

function getListmonkConfig() {
  const baseUrl = Deno.env.get("LISTMONK_URL")?.trim()?.replace(/\/$/, "") ?? "";
  const username = Deno.env.get("LISTMONK_USERNAME")?.trim() ?? "";
  const password = Deno.env.get("LISTMONK_PASSWORD")?.trim() ?? "";

  if (!baseUrl || !username || !password) {
    return null;
  }

  return {
    baseUrl,
    authHeader: `Basic ${btoa(`${username}:${password}`)}`,
  };
}

async function requestJson<T>(url: string, options: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(`Listmonk API request failed: ${response.status} ${response.statusText} ${text}`);
  }

  return body as T;
}

function escapeSqlLiteral(value: string) {
  return value.replaceAll("'", "''");
}

async function fetchManagedLists(baseUrl: string, authHeader: string) {
  const params = new URLSearchParams({
    per_page: "all",
    minimal: "true",
    status: "active",
  });

  const response = await requestJson<{ data?: { results?: ListmonkList[] } }>(
    `${baseUrl}/api/lists?${params.toString()}`,
    {
      headers: {
        Authorization: authHeader,
      },
    }
  );

  const byName = new Map((response.data?.results ?? []).map((entry) => [entry.name, entry]));
  return new Map(
    Object.entries(managedTopicLists)
      .map(([topic, listName]) => {
        const list = byName.get(listName);
        return list ? [topic, list] : null;
      })
      .filter((entry): entry is [string, ListmonkList] => entry !== null)
  );
}

async function fetchSubscriberByEmail(baseUrl: string, authHeader: string, email: string) {
  const params = new URLSearchParams({
    per_page: "all",
    query: `subscribers.email = '${escapeSqlLiteral(email)}'`,
  });

  const response = await requestJson<{ data?: { results?: ListmonkSubscriber[] } }>(
    `${baseUrl}/api/subscribers?${params.toString()}`,
    {
      headers: {
        Authorization: authHeader,
      },
    }
  );

  return (response.data?.results ?? []).find(
    (subscriber) => subscriber.email?.toLowerCase() === email.toLowerCase()
  ) ?? null;
}

async function updateSubscriberLists(
  baseUrl: string,
  authHeader: string,
  subscriberId: number,
  action: "add" | "remove",
  targetListIds: number[],
  status?: "confirmed"
) {
  if (!targetListIds.length) {
    return;
  }

  const payload: {
    ids: number[];
    action: "add" | "remove";
    target_list_ids: number[];
    status?: "confirmed";
  } = {
    ids: [subscriberId],
    action,
    target_list_ids: targetListIds,
  };

  if (status) {
    payload.status = status;
  }

  await requestJson(`${baseUrl}/api/subscribers/lists`, {
    method: "PUT",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function reconcileListmonkSubscriber(
  input: ReconcileListmonkSubscriberInput
): Promise<ListmonkSyncResult> {
  const config = getListmonkConfig();
  if (!config) {
    return {
      ok: true,
      synced: false,
      reason: "Listmonk environment variables are not configured.",
    };
  }

  try {
    const managedLists = await fetchManagedLists(config.baseUrl, config.authHeader);
    const managedListNameSet = new Set(Object.values(managedTopicLists));
    const desiredManagedListIds = input.subscribed
      ? input.topics
          .map((topic) => managedLists.get(topic)?.id)
          .filter((listId): listId is number => typeof listId === "number")
      : [];

    const existingSubscriber = await fetchSubscriberByEmail(config.baseUrl, config.authHeader, input.email);

    if (!existingSubscriber && !desiredManagedListIds.length) {
      return { ok: true, synced: true };
    }

    const attribs = {
      topics: input.topics,
      source: input.source ?? "landing-page",
      sync_source: "supabase",
      unsubscribe_token: input.unsubscribeToken ?? null,
    };

    if (!existingSubscriber) {
      await requestJson(`${config.baseUrl}/api/subscribers`, {
        method: "POST",
        headers: {
          Authorization: config.authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: input.email,
          name: input.email,
          status: "enabled",
          lists: desiredManagedListIds,
          attribs,
          preconfirm_subscriptions: true,
        }),
      });

      return { ok: true, synced: true };
    }

    await requestJson(`${config.baseUrl}/api/subscribers/${existingSubscriber.id}`, {
      method: "PATCH",
      headers: {
        Authorization: config.authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: input.email,
        name: input.email,
        status: "enabled",
        attribs,
      }),
    });

    const currentManagedLists = (existingSubscriber.lists ?? []).filter((list) =>
      managedListNameSet.has(list.name)
    );
    const listsToRemove = currentManagedLists
      .filter((list) => !desiredManagedListIds.includes(list.id))
      .map((list) => list.id);
    const listsToConfirm = desiredManagedListIds.filter((listId) => {
      const existingList = currentManagedLists.find((list) => list.id === listId);
      return !existingList || existingList.subscription_status !== "confirmed";
    });

    await updateSubscriberLists(
      config.baseUrl,
      config.authHeader,
      existingSubscriber.id,
      "remove",
      listsToRemove
    );
    await updateSubscriberLists(
      config.baseUrl,
      config.authHeader,
      existingSubscriber.id,
      "add",
      listsToConfirm,
      "confirmed"
    );

    return { ok: true, synced: true };
  } catch (error) {
    return {
      ok: false,
      synced: false,
      reason: error instanceof Error ? error.message : String(error),
    };
  }
}
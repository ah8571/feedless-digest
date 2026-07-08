type SendConfirmationEmailResult = {
  ok: true;
} | {
  ok: false;
  status: number;
  error: string;
};

export async function sendConfirmationEmail(email: string, confirmToken: string): Promise<SendConfirmationEmailResult> {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const confirmBaseUrl = Deno.env.get("CONFIRM_BASE_URL");
  const fromEmail =
    Deno.env.get("RESEND_FROM_EMAIL") ??
    "Feedfree Digest <onboarding@resend.dev>";

  if (!resendApiKey || !confirmBaseUrl) {
    return {
      ok: false,
      status: 500,
      error: "Missing required environment variables.",
    };
  }

  const confirmationUrl = new URL(confirmBaseUrl);
  confirmationUrl.searchParams.set("token", confirmToken);

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [email],
      subject: "Confirm your Feedfree Digest signup",
      text: [
        "Thanks for joining Feedfree Digest.",
        "",
        "Confirm your email by opening the link below:",
        confirmationUrl.toString(),
      ].join("\n"),
      html: `
        <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
          <h1 style="font-size: 20px; margin-bottom: 12px;">Confirm your Feedfree Digest signup</h1>
          <p style="margin-bottom: 12px;">Thanks for joining Feedfree Digest.</p>
          <p style="margin-bottom: 20px;">Click the link below to confirm your email address:</p>
          <p style="margin-bottom: 20px;">
            <a href="${confirmationUrl.toString()}" style="display: inline-block; padding: 10px 16px; background: #111827; color: #ffffff; text-decoration: none; border-radius: 999px;">Confirm email</a>
          </p>
          <p style="font-size: 14px; color: #4b5563;">If the button does not work, open this URL:</p>
          <p style="font-size: 14px; word-break: break-all; color: #4b5563;">${confirmationUrl.toString()}</p>
        </div>
      `.trim(),
    }),
  });

  if (!resendResponse.ok) {
    return {
      ok: false,
      status: 502,
      error: await resendResponse.text(),
    };
  }

  return {
    ok: true,
  };
}
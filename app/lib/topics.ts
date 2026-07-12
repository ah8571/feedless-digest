export const subnewsletterOptions = [
  { value: "ai-engineering", label: "AI engineering" },
  { value: "open-source-intrigues", label: "Open Source Intrigues" },
  { value: "crypto-investing", label: "Crypto Investing" },
  { value: "security", label: "Security" },
  { value: "compliance", label: "Compliance" },
  { value: "early-founder-bootstrapping", label: "Early founder bootstrapping" },
  { value: "lead-generation", label: "Lead Generation" },
  { value: "seo", label: "SEO" },
  { value: "cold-outreach-marketing", label: "Cold outreach marketing" },
  { value: "social-media-marketing", label: "Social Media marketing" },
] as const;

export const activeSubnewsletterOptions = subnewsletterOptions.filter(
  (o) =>
    o.value === "ai-engineering" ||
    o.value === "seo" ||
    o.value === "social-media-marketing",
);

export const subnewsletterTopicValues = subnewsletterOptions.map((option) => option.value);
import { z } from "zod";

const textBlock = z.string().min(1).max(800);

const sectionItemSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(500),
});

const sectionSchema = z.object({
  title: z.string().min(1).max(120),
  subtitle: z.string().min(1).max(400).optional(),
  items: z.array(sectionItemSchema).max(10).optional(),
  notes: z.array(textBlock).max(5).optional(),
  disclaimer: z.string().min(1).max(400).optional(),
});

const ctaSchema = z.object({
  heading: z.string().min(1).max(140),
  text: z.string().min(1).max(500),
  button_text: z.string().min(1).max(60),
  button_link: z.string().min(1).max(200),
});

export const servicePageContentSchema = z.object({
  schema_version: z.literal(1),
  intro: z.array(textBlock).max(3).optional(),
  sections: z.array(sectionSchema).max(20).optional(),
  exclusions: z.array(textBlock).max(20).optional(),
  disclaimers: z.array(textBlock).max(10).optional(),
  cta: ctaSchema.optional(),
});

export type ServicePageContent = z.infer<typeof servicePageContentSchema>;

export const parseServicePageContent = (raw: unknown): ServicePageContent | null => {
  if (!raw) return null;
  const result = servicePageContentSchema.safeParse(raw);
  return result.success ? result.data : null;
};

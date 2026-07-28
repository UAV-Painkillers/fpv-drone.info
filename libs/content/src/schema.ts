import { z } from 'zod';

export const pageMetaSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  description: z.string().optional(),
});
export type PageMeta = z.infer<typeof pageMetaSchema>;

export const stepMetaSchema = z.object({
  title: z.string().min(1),
  index: z.string().min(1),
  order: z.number().int().positive(),
  slug: z.string().min(1),
  image: z.string().optional(),
});
export type StepMeta = z.infer<typeof stepMetaSchema>;

export const guideMetaSchema = pageMetaSchema.extend({
  prerequisitesTitle: z.string().optional(),
  prerequisites: z.array(z.string()).optional(),
  prerequisitesImage: z.string().optional(),
  stepCount: z.number().int().positive(),
});
export type GuideMeta = z.infer<typeof guideMetaSchema>;

export const guideManifestSchema = guideMetaSchema.extend({
  steps: z.array(stepMetaSchema),
});
export type GuideManifest = z.infer<typeof guideManifestSchema>;

export const localeManifestSchema = z.object({
  pages: z.record(z.string(), pageMetaSchema),
  guides: z.record(z.string(), guideManifestSchema),
});
export type LocaleManifest = z.infer<typeof localeManifestSchema>;

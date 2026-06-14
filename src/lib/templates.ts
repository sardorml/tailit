/**
 * UI-facing view of the template registry. The canonical list (with adapters)
 * lives in `src/templates/registry.ts`; this module re-exports just the
 * metadata + a string id type so client code doesn't pull adapters into scope
 * unnecessarily and import sites stay stable.
 */
import {
  DEFAULT_TEMPLATE_ID,
  TEMPLATE_DEFS,
  getTemplateDef,
  isTemplateId,
} from "@/templates/registry";

export type TemplateId = string;

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  description: string;
  accent: string;
}

export const TEMPLATES: TemplateMeta[] = TEMPLATE_DEFS.map((t) => ({
  id: t.id,
  name: t.name,
  description: t.description,
  accent: t.accent,
}));

export const DEFAULT_TEMPLATE: TemplateId = DEFAULT_TEMPLATE_ID;

export { isTemplateId };

export function getTemplate(id: TemplateId): TemplateMeta {
  const t = getTemplateDef(id);
  return { id: t.id, name: t.name, description: t.description, accent: t.accent };
}

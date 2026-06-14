import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  applyResumePatch,
  emptyResume,
  type Resume,
  type ResumePatch,
} from "@/lib/resume/schema";
import type { JobData } from "@/lib/job/schema";
import type { TailorResult } from "@/lib/tailor/schema";
import { DEFAULT_TEMPLATE, type TemplateId } from "@/lib/templates";

export interface ChatTurn {
  role: "assistant" | "user";
  content: string;
}

interface AppState {
  /** The working resume (everything in the editor binds to this). */
  resume: Resume;
  /** Parsed job posting the user is targeting. */
  job: JobData | null;
  /** Result of the last tailoring run. */
  tailored: TailorResult | null;
  /** Selected PDF template. */
  templateId: TemplateId;
  /** Onboarding interview transcript. */
  messages: ChatTurn[];

  setResume: (r: Resume) => void;
  patchResume: (p: ResumePatch) => void;
  resetResume: () => void;

  setJob: (j: JobData | null) => void;
  setTailored: (t: TailorResult | null) => void;
  /** Replace the working resume with the tailored version. */
  applyTailored: () => void;

  setTemplate: (id: TemplateId) => void;

  addMessage: (m: ChatTurn) => void;
  setMessages: (m: ChatTurn[]) => void;
  resetChat: () => void;

  resetAll: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      resume: emptyResume(),
      job: null,
      tailored: null,
      templateId: DEFAULT_TEMPLATE,
      messages: [],

      setResume: (resume) => set({ resume }),
      patchResume: (patch) => set({ resume: applyResumePatch(get().resume, patch) }),
      resetResume: () => set({ resume: emptyResume() }),

      setJob: (job) => set({ job }),
      setTailored: (tailored) => set({ tailored }),
      applyTailored: () => {
        const t = get().tailored;
        if (t) set({ resume: t.resume });
      },

      setTemplate: (templateId) => set({ templateId }),

      addMessage: (m) => set({ messages: [...get().messages, m] }),
      setMessages: (messages) => set({ messages }),
      resetChat: () => set({ messages: [] }),

      resetAll: () =>
        set({
          resume: emptyResume(),
          job: null,
          tailored: null,
          templateId: DEFAULT_TEMPLATE,
          messages: [],
        }),
    }),
    {
      name: "tailor-store",
      version: 2,
      // v2 collapsed the three react-pdf templates into the single Typst
      // "vantage" template; normalize any stale persisted id.
      migrate: (persisted) => {
        const s = (persisted ?? {}) as Partial<AppState>;
        return { ...s, templateId: DEFAULT_TEMPLATE } as AppState;
      },
      storage: createJSONStorage(() => localStorage),
      // We rehydrate manually on mount (see useHydration) to avoid SSR mismatch.
      skipHydration: true,
      partialize: (s) => ({
        resume: s.resume,
        job: s.job,
        tailored: s.tailored,
        templateId: s.templateId,
        messages: s.messages,
      }),
    },
  ),
);

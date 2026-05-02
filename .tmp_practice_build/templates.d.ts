/**
 * Murciélingo template-based practice generator
 * ----------------------------------------------
 * Rule-based generator that produces large amounts of safe, predictable
 * A1/A2 practice items by combining templates with variable banks. Runs
 * locally in shared app logic (no AI, no network) so both the web app
 * and the React Native mobile app can use it identically.
 *
 * Generated items carry `source: "template"` so the practice engine can
 * tell them apart from curated items, and they come back in the same
 * `PracticeItem` shape so they slot straight into `buildPracticeSession`.
 */
import type { Level, PracticeItem, SkillCategory } from "./index";
export type TemplateFormat = "translate" | "mcq" | "fill" | "sentence" | "phrase" | "scenario";
export type BilingualText = {
    en: string;
    sv: string;
};
export interface VariableBankEntry {
    /** Used in id generation. */
    id: string;
    [field: string]: string | undefined;
}
export interface VariableBank {
    id: string;
    entries: VariableBankEntry[];
}
export interface PracticeTemplate {
    id: string;
    level: Level;
    skill: SkillCategory;
    /** Finer-grained category, e.g. "noun_gender", "verb_present", "cafe". */
    subskill: string;
    /**
     * Prompt text. Placeholders use `{var}` or `{var.field}` syntax. If the
     * field is omitted, the bank entry's primary surface field is used
     * (`es` if present, otherwise `id`).
     */
    promptTemplate: BilingualText;
    /** Same placeholder syntax as `promptTemplate`. */
    answerTemplate: string;
    /**
     * Map of variable name (used in placeholders) to the id of the
     * variable bank to draw from.
     */
    variables: Record<string, string>;
    /**
     * Optional alternative answers (each a template string). Used by the
     * runner's accepted-answer matching for free-text items.
     */
    acceptedAnswers?: string[];
    explanation?: BilingualText;
    difficulty: 1 | 2 | 3;
    /** How the renderer should treat the generated item. */
    format: TemplateFormat;
    /** Hard-coded MCQ options. Overrides `distractors` if both are set. */
    staticOptions?: string[];
    /** Sample distractors from a bank field (excluding the correct answer). */
    distractors?: {
        bank: string;
        field: string;
        count: number;
    };
}
export interface GeneratedPracticeItem {
    id: string;
    templateId: string;
    source: "template";
    level: Level;
    skill: SkillCategory;
    category: string;
    difficulty: 1 | 2 | 3;
    format: TemplateFormat;
    prompt: BilingualText;
    answer: string;
    acceptedAnswers: string[];
    options?: string[];
    explanation?: BilingualText;
}
export interface GenerateOptions {
    templates?: ReadonlyArray<PracticeTemplate>;
    banks?: Readonly<Record<string, VariableBank>>;
    /** Maximum variants produced per template. Default 6. */
    maxPerTemplate?: number;
    /** Hard cap on total generated items. Default 200. */
    maxTotal?: number;
    /** Only generate items at or below this CEFR level. */
    upToLevel?: Level;
    /** Restrict generation to a subset of levels. */
    levels?: ReadonlyArray<Level>;
    /** Inject for deterministic tests. */
    random?: () => number;
    /**
     * Item ids that have already been used in the current session — the
     * generator will avoid producing duplicates of these.
     */
    excludeIds?: ReadonlySet<string>;
}
export declare const BUILTIN_BANKS: Record<string, VariableBank>;
export declare const BUILTIN_TEMPLATES: PracticeTemplate[];
export declare function generatePracticeItems(opts?: GenerateOptions): GeneratedPracticeItem[];
/**
 * Convenience: convert a `GeneratedPracticeItem` into a generic
 * `PracticeItem` whose payload is the generated item itself. Apps
 * typically wrap with their own payload adapter instead.
 */
export declare function toPracticeItem(generated: GeneratedPracticeItem): PracticeItem<GeneratedPracticeItem>;
//# sourceMappingURL=templates.d.ts.map
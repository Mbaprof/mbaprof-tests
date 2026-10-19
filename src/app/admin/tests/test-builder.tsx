"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

import { TEST_TYPES, type TestTypeValue } from "@/lib/test-types";
import { uploadImage } from "@/lib/upload-image";
import { MBA_ENTRANCE_EXAMS, type TestInput } from "@/lib/validation";

import { createTest, updateTest } from "./actions";

type OptionState = { id: string; text: string; imageUrl: string; isCorrect: boolean };
type QuestionState = {
  id: string;
  text: string;
  imageUrl: string;
  explanation: string;
  marks: number;
  options: OptionState[];
};
type BlockState = {
  id: string;
  passage: { title: string; text: string } | null;
  questions: QuestionState[];
};
type SectionState = { id: string; name: string; blocks: BlockState[] };

function newId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

function newOption(): OptionState {
  return { id: newId(), text: "", imageUrl: "", isCorrect: false };
}

function newQuestion(): QuestionState {
  return {
    id: newId(),
    text: "",
    imageUrl: "",
    explanation: "",
    marks: 1,
    options: [newOption(), newOption()],
  };
}

function newStandaloneBlock(): BlockState {
  return { id: newId(), passage: null, questions: [newQuestion()] };
}

function newPassageBlock(): BlockState {
  return {
    id: newId(),
    passage: { title: "", text: "" },
    questions: [newQuestion(), newQuestion()],
  };
}

function newSection(name: string): SectionState {
  return { id: newId(), name, blocks: [newStandaloneBlock()] };
}

export type InitialTestData = {
  title: string;
  description: string;
  targetExam: string;
  testType: string;
  durationMinutes: number;
  sections: SectionState[];
};

const inputClass =
  "mt-1 w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy";

function ImageField({
  imageUrl,
  onChange,
  size = "md",
}: {
  imageUrl: string;
  onChange: (url: string) => void;
  size?: "sm" | "md";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const thumbClass = size === "sm" ? "h-10 w-10" : "h-24 w-24";

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {imageUrl ? (
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt=""
            className={`${thumbClass} rounded-md border border-black/10 object-cover`}
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-xs text-red-700 hover:underline"
          >
            Remove image
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="rounded-md border border-dashed border-black/20 px-2.5 py-1.5 text-xs font-medium text-brand-navy hover:bg-black/5 disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "+ Add image"}
        </button>
      )}
      {error && <span className="text-xs text-red-700">{error}</span>}
    </div>
  );
}

function QuestionEditor({
  question,
  index,
  canRemove,
  onRemove,
  onUpdate,
  onAddOption,
  onRemoveOption,
  onUpdateOption,
  onSetCorrect,
}: {
  question: QuestionState;
  index: number;
  canRemove: boolean;
  onRemove: () => void;
  onUpdate: (patch: Partial<QuestionState>) => void;
  onAddOption: () => void;
  onRemoveOption: (optionId: string) => void;
  onUpdateOption: (optionId: string, patch: Partial<OptionState>) => void;
  onSetCorrect: (optionId: string) => void;
}) {
  return (
    <div className="rounded-lg border border-black/10 bg-white p-4 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-semibold text-brand-ink/70">
          Question {index + 1}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-red-700 hover:underline"
          >
            Remove question
          </button>
        )}
      </div>

      <div>
        <textarea
          value={question.text}
          onChange={(e) => onUpdate({ text: e.target.value })}
          placeholder="Question text"
          rows={2}
          className={inputClass}
        />
        <p className="mt-1 text-xs text-brand-ink/40">
          Wrap math in $...$ for rendering, e.g. $x^2 + 3x = 0$
        </p>
      </div>

      <ImageField
        imageUrl={question.imageUrl}
        onChange={(imageUrl) => onUpdate({ imageUrl })}
      />

      <div className="space-y-2">
        {question.options.map((option, oIndex) => (
          <div key={option.id} className="flex flex-wrap items-center gap-2">
            <input
              type="radio"
              name={`correct-${question.id}`}
              checked={option.isCorrect}
              onChange={() => onSetCorrect(option.id)}
              className="h-4 w-4 accent-brand-navy"
              aria-label={`Mark option ${oIndex + 1} correct`}
            />
            <input
              value={option.text}
              onChange={(e) => onUpdateOption(option.id, { text: e.target.value })}
              placeholder={`Option ${oIndex + 1}`}
              className="flex-1 rounded-md border border-black/10 bg-white px-3 py-1.5 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
            />
            <ImageField
              imageUrl={option.imageUrl}
              onChange={(imageUrl) => onUpdateOption(option.id, { imageUrl })}
              size="sm"
            />
            {question.options.length > 2 && (
              <button
                type="button"
                onClick={() => onRemoveOption(option.id)}
                className="text-xs text-red-700 hover:underline"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        {question.options.length < 6 && (
          <button
            type="button"
            onClick={onAddOption}
            className="text-xs font-medium text-brand-navy hover:underline"
          >
            + Add option
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs font-medium text-brand-ink/70">
            Marks
          </label>
          <input
            type="number"
            min={1}
            max={100}
            value={question.marks}
            onChange={(e) => onUpdate({ marks: Number(e.target.value) })}
            className="mt-1 w-20 rounded-md border border-black/10 bg-white px-3 py-1.5 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
          />
        </div>
        <div className="min-w-[240px] flex-1">
          <label className="block text-xs font-medium text-brand-ink/70">
            Explanation (shown after submission)
          </label>
          <input
            value={question.explanation}
            onChange={(e) => onUpdate({ explanation: e.target.value })}
            className="mt-1 w-full rounded-md border border-black/10 bg-white px-3 py-1.5 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
          />
        </div>
      </div>
    </div>
  );
}

export function TestBuilder({
  testId,
  initialData,
  initialExam,
}: {
  testId?: string;
  initialData?: InitialTestData;
  initialExam?: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [targetExam, setTargetExam] = useState<
    (typeof MBA_ENTRANCE_EXAMS)[number]
  >(
    (initialData?.targetExam ??
      initialExam ??
      MBA_ENTRANCE_EXAMS[0]) as (typeof MBA_ENTRANCE_EXAMS)[number]
  );
  const [testType, setTestType] = useState<TestTypeValue>(
    (initialData?.testType as TestTypeValue | undefined) ?? "FULL_LENGTH"
  );
  const [durationMinutes, setDurationMinutes] = useState(
    initialData?.durationMinutes ?? 60
  );
  const [sections, setSections] = useState<SectionState[]>(
    initialData?.sections ?? [newSection("Section 1")]
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateSectionState(sectionId: string, fn: (s: SectionState) => SectionState) {
    setSections((prev) => prev.map((s) => (s.id === sectionId ? fn(s) : s)));
  }

  function updateBlock(sectionId: string, blockId: string, fn: (b: BlockState) => BlockState) {
    updateSectionState(sectionId, (s) => ({
      ...s,
      blocks: s.blocks.map((b) => (b.id === blockId ? fn(b) : b)),
    }));
  }

  function updateQuestionIn(
    sectionId: string,
    blockId: string,
    questionId: string,
    fn: (q: QuestionState) => QuestionState
  ) {
    updateBlock(sectionId, blockId, (b) => ({
      ...b,
      questions: b.questions.map((q) => (q.id === questionId ? fn(q) : q)),
    }));
  }

  function updateSectionName(sectionId: string, name: string) {
    updateSectionState(sectionId, (s) => ({ ...s, name }));
  }

  function addSection() {
    setSections((prev) => [...prev, newSection(`Section ${prev.length + 1}`)]);
  }

  function removeSection(sectionId: string) {
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
  }

  function addStandaloneQuestion(sectionId: string) {
    updateSectionState(sectionId, (s) => ({
      ...s,
      blocks: [...s.blocks, newStandaloneBlock()],
    }));
  }

  function addPassage(sectionId: string) {
    updateSectionState(sectionId, (s) => ({
      ...s,
      blocks: [...s.blocks, newPassageBlock()],
    }));
  }

  function removeBlock(sectionId: string, blockId: string) {
    updateSectionState(sectionId, (s) => ({
      ...s,
      blocks: s.blocks.filter((b) => b.id !== blockId),
    }));
  }

  function updatePassage(
    sectionId: string,
    blockId: string,
    patch: Partial<{ title: string; text: string }>
  ) {
    updateBlock(sectionId, blockId, (b) =>
      b.passage ? { ...b, passage: { ...b.passage, ...patch } } : b
    );
  }

  function addQuestionToBlock(sectionId: string, blockId: string) {
    updateBlock(sectionId, blockId, (b) => ({
      ...b,
      questions: [...b.questions, newQuestion()],
    }));
  }

  function removeQuestionFromBlock(sectionId: string, blockId: string, questionId: string) {
    updateBlock(sectionId, blockId, (b) => ({
      ...b,
      questions: b.questions.filter((q) => q.id !== questionId),
    }));
  }

  function buildPayload(): TestInput {
    return {
      title,
      description,
      targetExam,
      testType,
      durationMinutes,
      // Premium gating is not used on MBAProf Tests - every test is open.
      isFreePreview: true,
      sections: sections.map((s) => ({
        id: s.id,
        name: s.name,
        blocks: s.blocks.map((b) => {
          const mapQ = (q: QuestionState) => ({
            id: q.id,
            text: q.text,
            imageUrl: q.imageUrl,
            explanation: q.explanation,
            marks: q.marks,
            options: q.options.map((o) => ({
              id: o.id,
              text: o.text,
              imageUrl: o.imageUrl,
              isCorrect: o.isCorrect,
            })),
          });
          return b.passage
            ? {
                kind: "passage" as const,
                passage: {
                  id: b.id,
                  passageTitle: b.passage.title,
                  passageText: b.passage.text,
                  questions: b.questions.map(mapQ),
                },
              }
            : { kind: "question" as const, question: mapQ(b.questions[0]) };
        }),
      })),
    };
  }

  function handleSave(published: boolean) {
    setError(null);
    startTransition(async () => {
      const payload = buildPayload();
      const result = testId
        ? await updateTest(testId, payload, published)
        : await createTest(payload, published);
      if (result?.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-8 pb-24">
      {error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="rounded-xl border border-black/5 bg-white p-6 space-y-4">
        <h2 className="text-lg font-semibold text-brand-navy">Test details</h2>

        <div>
          <label className="block text-sm font-medium text-brand-ink">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. CAT Full Mock 1"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-ink">
            Entrance exam
          </label>
          <select
            value={targetExam}
            onChange={(e) =>
              setTargetExam(e.target.value as (typeof MBA_ENTRANCE_EXAMS)[number])
            }
            className={inputClass}
          >
            {MBA_ENTRANCE_EXAMS.map((exam) => (
              <option key={exam} value={exam}>
                {exam}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-ink">
            Test type
          </label>
          <select
            value={testType}
            onChange={(e) => setTestType(e.target.value as TestTypeValue)}
            className={inputClass}
          >
            {TEST_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-brand-ink/50">
            Students can filter the test list by this.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-ink">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-ink">
            Duration (minutes)
          </label>
          <input
            type="number"
            min={1}
            max={600}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
            className="mt-1 w-32 rounded-md border border-black/10 px-3 py-2 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
          />
        </div>

      </div>

      {sections.map((section, sIndex) => {
        let questionCounter = 0;

        return (
          <div
            key={section.id}
            className="rounded-xl border border-black/5 bg-white p-6 space-y-6"
          >
            <div className="flex items-center justify-between gap-4">
              <input
                value={section.name}
                onChange={(e) => updateSectionName(section.id, e.target.value)}
                placeholder={`Section ${sIndex + 1} name`}
                className="w-full max-w-sm rounded-md border border-black/10 px-3 py-2 text-sm font-semibold text-brand-navy focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
              />
              {sections.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSection(section.id)}
                  className="text-sm text-red-700 hover:underline"
                >
                  Remove section
                </button>
              )}
            </div>

            <div className="space-y-6">
              {section.blocks.map((block) => {
                if (!block.passage) {
                  const question = block.questions[0];
                  const index = questionCounter;
                  questionCounter += 1;
                  return (
                    <QuestionEditor
                      key={block.id}
                      question={question}
                      index={index}
                      canRemove={section.blocks.length > 1}
                      onRemove={() => removeBlock(section.id, block.id)}
                      onUpdate={(patch) =>
                        updateQuestionIn(section.id, block.id, question.id, (q) => ({
                          ...q,
                          ...patch,
                        }))
                      }
                      onAddOption={() =>
                        updateQuestionIn(section.id, block.id, question.id, (q) =>
                          q.options.length < 6
                            ? { ...q, options: [...q.options, newOption()] }
                            : q
                        )
                      }
                      onRemoveOption={(optionId) =>
                        updateQuestionIn(section.id, block.id, question.id, (q) =>
                          q.options.length > 2
                            ? { ...q, options: q.options.filter((o) => o.id !== optionId) }
                            : q
                        )
                      }
                      onUpdateOption={(optionId, patch) =>
                        updateQuestionIn(section.id, block.id, question.id, (q) => ({
                          ...q,
                          options: q.options.map((o) =>
                            o.id === optionId ? { ...o, ...patch } : o
                          ),
                        }))
                      }
                      onSetCorrect={(optionId) =>
                        updateQuestionIn(section.id, block.id, question.id, (q) => ({
                          ...q,
                          options: q.options.map((o) => ({
                            ...o,
                            isCorrect: o.id === optionId,
                          })),
                        }))
                      }
                    />
                  );
                }

                const startIndex = questionCounter;
                questionCounter += block.questions.length;

                return (
                  <div
                    key={block.id}
                    className="rounded-xl border-2 border-brand-gold/30 bg-brand-cream/40 p-4 space-y-5"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs font-semibold uppercase tracking-wide text-brand-gold">
                        Shared passage
                      </span>
                      <button
                        type="button"
                        onClick={() => removeBlock(section.id, block.id)}
                        className="text-xs text-red-700 hover:underline"
                      >
                        Remove passage &amp; all its questions
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-brand-ink/70">
                        Passage title (optional)
                      </label>
                      <input
                        value={block.passage.title}
                        onChange={(e) =>
                          updatePassage(section.id, block.id, { title: e.target.value })
                        }
                        placeholder="e.g. Reading Comprehension Passage 1"
                        className="mt-1 w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-brand-ink/70">
                        Passage text
                      </label>
                      <textarea
                        value={block.passage.text}
                        onChange={(e) =>
                          updatePassage(section.id, block.id, { text: e.target.value })
                        }
                        placeholder="Paste the full passage here - every question below will show it."
                        rows={6}
                        className="mt-1 w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
                      />
                    </div>

                    <div className="space-y-4 border-t border-brand-gold/20 pt-4">
                      {block.questions.map((question, qIdx) => (
                        <QuestionEditor
                          key={question.id}
                          question={question}
                          index={startIndex + qIdx}
                          canRemove={block.questions.length > 1}
                          onRemove={() =>
                            removeQuestionFromBlock(section.id, block.id, question.id)
                          }
                          onUpdate={(patch) =>
                            updateQuestionIn(section.id, block.id, question.id, (q) => ({
                              ...q,
                              ...patch,
                            }))
                          }
                          onAddOption={() =>
                            updateQuestionIn(section.id, block.id, question.id, (q) =>
                              q.options.length < 6
                                ? { ...q, options: [...q.options, newOption()] }
                                : q
                            )
                          }
                          onRemoveOption={(optionId) =>
                            updateQuestionIn(section.id, block.id, question.id, (q) =>
                              q.options.length > 2
                                ? {
                                    ...q,
                                    options: q.options.filter((o) => o.id !== optionId),
                                  }
                                : q
                            )
                          }
                          onUpdateOption={(optionId, patch) =>
                            updateQuestionIn(section.id, block.id, question.id, (q) => ({
                              ...q,
                              options: q.options.map((o) =>
                                o.id === optionId ? { ...o, ...patch } : o
                              ),
                            }))
                          }
                          onSetCorrect={(optionId) =>
                            updateQuestionIn(section.id, block.id, question.id, (q) => ({
                              ...q,
                              options: q.options.map((o) => ({
                                ...o,
                                isCorrect: o.id === optionId,
                              })),
                            }))
                          }
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => addQuestionToBlock(section.id, block.id)}
                      className="text-xs font-medium text-brand-navy hover:underline"
                    >
                      + Add another question to this passage
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => addStandaloneQuestion(section.id)}
                className="text-sm font-medium text-brand-navy hover:underline"
              >
                + Add question to this section
              </button>
              <button
                type="button"
                onClick={() => addPassage(section.id)}
                className="text-sm font-medium text-brand-gold hover:underline"
              >
                + Add passage with sub-questions
              </button>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={addSection}
        className="rounded-md border border-brand-navy/20 px-5 py-2.5 text-sm font-semibold text-brand-navy hover:bg-brand-navy/5"
      >
        + Add section
      </button>

      <div className="fixed inset-x-0 bottom-0 border-t border-black/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-end gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleSave(false)}
            className="flex-1 rounded-md border border-brand-navy/20 px-5 py-2.5 text-sm font-semibold text-brand-navy hover:bg-brand-navy/5 disabled:opacity-50 sm:flex-none"
          >
            Save as draft
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleSave(true)}
            className="flex-1 rounded-md bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-navy-light disabled:opacity-50 sm:flex-none"
          >
            {isPending ? "Saving..." : "Save & publish"}
          </button>
        </div>
      </div>
    </div>
  );
}

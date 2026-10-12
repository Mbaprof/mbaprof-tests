"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { MathText } from "@/components/math-text";

import { loadReview, type ReviewQuestion } from "./actions";

// Jump straight to a question card, leaving room for the page header.
function jumpToQuestion(questionId: string) {
  const el = document.getElementById(`q-${questionId}`);
  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 96, behavior: "instant" });
}

// The question-by-question review. It is fetched when the student opens it
// (or follows a Q# link from the breakdown above) and drawn in their own
// browser, so the results page itself stays light for the server.
export function ReviewSection({ attemptId, questionCount }: { attemptId: string; questionCount: number }) {
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [questions, setQuestions] = useState<ReviewQuestion[]>([]);
  const wantedQuestion = useRef<string | null>(null);

  const fetchReview = useCallback(async () => {
    setStatus("loading");
    try {
      setQuestions(await loadReview(attemptId));
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, [attemptId]);

  const open = useCallback(
    async (questionId?: string) => {
      if (questionId) wantedQuestion.current = questionId;
      if (status === "loading" || status === "ready") return;
      await fetchReview();
    },
    [status, fetchReview]
  );

  // "Q12" links in the breakdown tables ask us to open the review at that question.
  useEffect(() => {
    const handler = (event: Event) => {
      const id = (event as CustomEvent<{ questionId: string }>).detail?.questionId;
      if (status === "ready" && id) {
        jumpToQuestion(id);
      } else {
        void open(id);
      }
    };
    window.addEventListener("open-review", handler);
    return () => window.removeEventListener("open-review", handler);
  }, [open, status]);

  // A shared link that ends in #q-<id> opens the review straight away.
  useEffect(() => {
    const match = window.location.hash.match(/^#q-(.+)$/);
    if (match) void open(match[1]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Once drawn, scroll to the question the student asked for.
  useEffect(() => {
    if (status !== "ready" || !wantedQuestion.current) return;
    const id = wantedQuestion.current;
    wantedQuestion.current = null;
    // a short timer rather than requestAnimationFrame: it also fires in background tabs
    const timer = setTimeout(() => jumpToQuestion(id), 50);
    return () => clearTimeout(timer);
  }, [status]);

  let lastPassageId: string | null = null;

  return (
    <section className="mt-10" id="answer-review">
      <h2 className="text-lg font-semibold text-brand-navy">Answer review</h2>

      {status === "idle" && (
        <div className="mt-4 rounded-xl border border-black/5 bg-white p-6 text-center">
          <p className="text-sm text-brand-ink/70">
            See every question with the correct answer, your answer and the explanation.
          </p>
          <button
            type="button"
            onClick={() => void open()}
            className="mt-4 rounded-md bg-brand-navy px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light"
          >
            Show answer review ({questionCount} questions)
          </button>
        </div>
      )}

      {status === "loading" && (
        <p role="status" className="mt-4 rounded-xl border border-black/5 bg-white p-6 text-center text-sm text-brand-ink/60">
          Loading your answer review...
        </p>
      )}

      {status === "error" && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-700">We could not load the review. Please try again.</p>
          <button
            type="button"
            onClick={() => void fetchReview()}
            className="mt-3 rounded-md bg-brand-navy px-5 py-2 text-sm font-semibold text-white hover:bg-brand-navy-light"
          >
            Try again
          </button>
        </div>
      )}

      {status === "ready" && (
        <div className="mt-4 space-y-4">
          {questions.map((question) => {
            const isSkipped = !question.selectedOptionId;
            const correctOption = question.options.find((o) => o.isCorrect);
            const isCorrect = !!question.selectedOptionId && question.selectedOptionId === correctOption?.id;
            const showPassage = question.passage && question.passage.id !== lastPassageId;
            lastPassageId = question.passage?.id ?? null;

            return (
              <div key={question.id}>
                {showPassage && question.passage && (
                  <div className="mb-3 rounded-xl border border-brand-gold/30 bg-brand-cream/40 p-4">
                    {question.passage.title && (
                      <p className="mb-1 font-semibold text-brand-navy">{question.passage.title}</p>
                    )}
                    <MathText text={question.passage.text} className="text-sm text-brand-ink/80" />
                  </div>
                )}
                <div id={`q-${question.id}`} className="scroll-mt-24 rounded-xl border border-black/5 bg-white p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="text-sm font-medium text-brand-ink">
                      <span>Q{question.index + 1}. </span>
                      <MathText text={question.text} />
                      {question.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={question.imageUrl}
                          alt="Question illustration"
                          className="mt-2 max-h-72 rounded-md border border-black/10 object-contain"
                        />
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          isSkipped
                            ? "bg-black/5 text-brand-ink/50"
                            : isCorrect
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {isSkipped ? "Skipped" : isCorrect ? "Correct" : "Incorrect"}
                      </span>
                      <span className="text-xs text-brand-ink/50">
                        Difficulty: {question.difficulty === null ? "-" : `${question.difficulty}%`}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    {question.options.map((option, oIndex) => {
                      const isSelected = question.selectedOptionId === option.id;
                      return (
                        <div
                          key={option.id}
                          className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${
                            option.isCorrect
                              ? "border-green-300 bg-green-50"
                              : isSelected
                                ? "border-red-300 bg-red-50"
                                : "border-black/10"
                          }`}
                        >
                          <span className="text-brand-ink/50">{String.fromCharCode(65 + oIndex)}.</span>
                          <span className="flex-1">
                            <MathText text={option.text} />
                            {option.imageUrl && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={option.imageUrl}
                                alt="Option illustration"
                                className="mt-2 max-h-40 rounded-md border border-black/10 object-contain"
                              />
                            )}
                          </span>
                          {option.isCorrect && (
                            <span className="ml-auto text-xs font-semibold text-green-700">Correct answer</span>
                          )}
                          {isSelected && !option.isCorrect && (
                            <span className="ml-auto text-xs font-semibold text-red-700">Your answer</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {question.explanation && (
                    <p className="mt-3 rounded-md bg-brand-cream p-3 text-sm text-brand-ink/80">
                      <span className="font-semibold text-brand-navy">Explanation: </span>
                      <MathText text={question.explanation} />
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

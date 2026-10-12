// Negative marking, per entrance exam. The penalty for a wrong answer is a
// fraction of that question's marks, so it scales with however an admin sets
// question marks: MAT/ATMA lose a quarter of the marks; CAT loses a third
// (build CAT tests with 3-mark questions to get the real +3 / -1 scheme).
// Unattempted questions never lose marks. MAH-CET and UG BMS CET have no
// negative marking in the real exam, so they are absent here.
const NEGATIVE_MARK_RATIO: Record<string, number> = {
  CAT: 1 / 3,
  MAT: 0.25,
  ATMA: 0.25,
};

export function negativeRatioFor(targetExam: string) {
  return NEGATIVE_MARK_RATIO[targetExam] ?? 0;
}

// Scores hold at most two decimals; rounding avoids float noise like
// 97.66999999 when penalties of 1/3 are added up.
export function roundMarks(n: number) {
  return Math.round(n * 100) / 100;
}

export function formatMarks(n: number) {
  return Number.isInteger(n) ? String(n) : String(roundMarks(n));
}

export function penaltyFor(marks: number, ratio: number) {
  return roundMarks(marks * ratio);
}

// e.g. "+1 for each correct answer, -0.25 for each wrong answer"
export function markingSummary(targetExam: string, marks = 1) {
  const ratio = negativeRatioFor(targetExam);
  if (ratio === 0) return null;
  return `+${formatMarks(marks)} for each correct answer, -${formatMarks(
    penaltyFor(marks, ratio)
  )} for each wrong answer, 0 if left unanswered`;
}

type ScorableQuestion = {
  id: string;
  marks: number;
  options: { id: string; isCorrect: boolean }[];
};

// Net score and total marks for one attempt. `selected` maps questionId to
// the chosen option id; unanswered questions are absent (or null).
export function scoreAttempt(
  questions: ScorableQuestion[],
  selected: Map<string, string | null | undefined>,
  negativeRatio: number
) {
  let score = 0;
  let totalMarks = 0;
  let correct = 0;
  let wrong = 0;

  for (const question of questions) {
    totalMarks += question.marks;
    const choice = selected.get(question.id);
    if (!choice) continue; // unanswered: no marks, no penalty
    const correctOption = question.options.find((o) => o.isCorrect);
    if (correctOption && choice === correctOption.id) {
      score += question.marks;
      correct += 1;
    } else {
      // Unrounded here: rounding each penalty separately lets the error add up.
      score -= question.marks * negativeRatio;
      wrong += 1;
    }
  }

  return { score: roundMarks(score), totalMarks, correct, wrong };
}

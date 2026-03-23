import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Home, RotateCcw, Trophy, XCircle } from "lucide-react";
import { useState } from "react";
import type { Question, Test, TestResult } from "../backend.d";

interface ResultScreenProps {
  result: TestResult;
  test: Test | null;
  questions: Question[];
  userAnswers: bigint[];
  userName?: string;
  onRetry: () => void;
  onHome: () => void;
}

const OPTION_LABELS = ["A", "B", "C", "D"];

export default function ResultScreen({
  result,
  test,
  questions,
  userAnswers,
  userName,
  onRetry,
  onHome,
}: ResultScreenProps) {
  const [showReview, setShowReview] = useState(false);

  const _score = Number(result.score);
  const total = Number(result.totalQuestions);
  const correct = Number(result.correctAnswers);
  const incorrect = total - correct;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  const passed = percentage >= 60;

  // Circular progress
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (percentage / 100) * circumference;

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      {/* Score card */}
      <div className="bg-card rounded-2xl border border-border shadow-card p-8 text-center space-y-6">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Trophy className="w-5 h-5" />
          <span className="font-medium">{test?.title ?? "Test"} — Results</span>
        </div>

        {/* User name & score banner */}
        {userName && (
          <div className="bg-primary/10 border border-primary/20 rounded-xl px-6 py-4 space-y-1">
            <p className="text-base text-muted-foreground">Participant</p>
            <p className="text-2xl font-bold text-primary">{userName}</p>
            <p className="text-sm font-semibold text-foreground">
              Total Score:{" "}
              <span className="text-primary">
                {correct}/{total}
              </span>
            </p>
          </div>
        )}

        {/* Circular progress */}
        <div className="flex justify-center">
          <div className="relative">
            <svg
              width="160"
              height="160"
              className="-rotate-90"
              aria-hidden="true"
            >
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke="oklch(var(--border))"
                strokeWidth="10"
              />
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={
                  passed ? "oklch(var(--success))" : "oklch(var(--destructive))"
                }
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                style={{ transition: "stroke-dashoffset 0.8s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-foreground">
                {percentage}%
              </span>
              <span className="text-sm text-muted-foreground">Score</span>
            </div>
          </div>
        </div>

        <div>
          <Badge
            className={`text-sm px-4 py-1 ${
              passed
                ? "bg-success/10 text-success border-success/20"
                : "bg-destructive/10 text-destructive border-destructive/20"
            }`}
            variant="outline"
          >
            {passed ? "🎉 Passed!" : "Keep Practicing"}
          </Badge>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Total Score",
              value: `${correct}/${total}`,
              color: "text-foreground",
            },
            { label: "Correct", value: correct, color: "text-success" },
            { label: "Incorrect", value: incorrect, color: "text-destructive" },
          ].map((stat) => (
            <div key={stat.label} className="bg-secondary rounded-xl p-4">
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 justify-center flex-wrap">
          <Button
            data-ocid="result.home.button"
            variant="outline"
            onClick={onHome}
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" /> Back to Home
          </Button>
          <Button
            data-ocid="result.retry.button"
            variant="outline"
            onClick={onRetry}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Retry Test
          </Button>
          <Button
            data-ocid="result.review.button"
            className="bg-primary text-primary-foreground hover:opacity-90 flex items-center gap-2"
            onClick={() => setShowReview((v) => !v)}
          >
            {showReview ? "Hide Review" : "Review Answers"}
          </Button>
        </div>
      </div>

      {/* Answer review */}
      {showReview && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-foreground">Answer Review</h2>
          {questions.map((q, idx) => {
            const userAnswer = userAnswers[idx];
            const correct_idx = Number(q.correctOptionIndex);
            const user_idx = userAnswer !== undefined ? Number(userAnswer) : -1;
            const isCorrect = user_idx === correct_idx;
            const detail = result.details[idx];
            const detailCorrect = detail ? detail[1] : false;

            return (
              <div
                key={String(q.id)}
                data-ocid={`result.review.item.${idx + 1}`}
                className={`bg-card rounded-xl border p-5 space-y-3 ${
                  detailCorrect || isCorrect
                    ? "border-success/30"
                    : "border-destructive/30"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-foreground leading-snug">
                    <span className="text-muted-foreground mr-2">
                      Q{idx + 1}.
                    </span>
                    {q.questionText}
                  </p>
                  {detailCorrect || isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-success shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-destructive shrink-0" />
                  )}
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {q.options.map((opt, optIdx) => {
                    const isCorrectOpt = optIdx === correct_idx;
                    const isUserOpt = optIdx === user_idx;
                    let cls =
                      "border-border bg-secondary text-muted-foreground";
                    if (isCorrectOpt)
                      cls =
                        "border-success/40 bg-success/10 text-success font-medium";
                    if (isUserOpt && !isCorrectOpt)
                      cls =
                        "border-destructive/40 bg-destructive/10 text-destructive";
                    return (
                      <div
                        key={`${String(q.id)}-opt-${optIdx}`}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs ${cls}`}
                      >
                        <span className="font-bold w-4">
                          {OPTION_LABELS[optIdx]}
                        </span>
                        <span>{opt}</span>
                        {isCorrectOpt && (
                          <span className="ml-auto text-xs">✓ Correct</span>
                        )}
                        {isUserOpt && !isCorrectOpt && (
                          <span className="ml-auto text-xs">✗ Your answer</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>
      )}
    </main>
  );
}

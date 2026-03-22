import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { Question, Test } from "../backend.d";

interface TestScreenProps {
  test: Test | null;
  questions: Question[];
  isLoading: boolean;
  onSubmit: (answers: bigint[]) => void;
  isSubmitting: boolean;
}

const OPTION_LABELS = ["A", "B", "C", "D"];

export default function TestScreen({
  test,
  questions,
  isLoading,
  onSubmit,
  isSubmitting,
}: TestScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, bigint>>({});
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [timerStarted, setTimerStarted] = useState(false);

  // Initialize timer when test loads
  useEffect(() => {
    if (test && !timerStarted) {
      setSecondsLeft(Number(test.timeLimitMinutes) * 60);
      setTimerStarted(true);
    }
  }, [test, timerStarted]);

  const handleSubmit = useCallback(() => {
    if (!test) return;
    const answerArray = questions.map((_q, i) => answers[i] ?? BigInt(-1));
    onSubmit(answerArray);
  }, [test, questions, answers, onSubmit]);

  // Countdown timer
  useEffect(() => {
    if (!timerStarted || secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerStarted, secondsLeft, handleSubmit]);

  if (isLoading || !test) {
    return (
      <main
        className="max-w-2xl mx-auto px-4 py-8 space-y-6"
        data-ocid="test.loading_state"
      >
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 rounded-xl" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      </main>
    );
  }

  const question = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progressPct =
    totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeWarning = secondsLeft < 60;

  // Circular timer
  const timerRadius = 32;
  const totalTime = Number(test.timeLimitMinutes) * 60;
  const timerCircumference = 2 * Math.PI * timerRadius;
  const timerOffset =
    totalTime > 0 ? timerCircumference * (1 - secondsLeft / totalTime) : 0;

  if (!question) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-8 text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">
          No questions found for this test.
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">{test.title}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Question {currentIndex + 1} of {totalQuestions}
          </p>
        </div>

        {/* Circular Timer */}
        <div className="shrink-0 relative">
          <svg width="84" height="84" className="-rotate-90" aria-hidden="true">
            <circle
              cx="42"
              cy="42"
              r={timerRadius}
              fill="none"
              stroke="oklch(var(--border))"
              strokeWidth="6"
            />
            <circle
              cx="42"
              cy="42"
              r={timerRadius}
              fill="none"
              stroke={
                timeWarning
                  ? "oklch(var(--destructive))"
                  : "oklch(var(--primary))"
              }
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={timerCircumference}
              strokeDashoffset={timerOffset}
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Clock
              className={`w-3 h-3 mb-0.5 ${timeWarning ? "text-destructive" : "text-muted-foreground"}`}
            />
            <span
              className={`text-sm font-bold tabular-nums ${timeWarning ? "text-destructive" : "text-foreground"}`}
            >
              {String(minutes).padStart(2, "0")}:
              {String(seconds).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {answeredCount}/{totalQuestions} answered
          </span>
          <span>{Math.round(progressPct)}%</span>
        </div>
        <Progress
          value={progressPct}
          className="h-2"
          data-ocid="test.progress"
        />
      </div>

      {/* Question card */}
      <div className="bg-card rounded-2xl border border-border shadow-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="secondary" className="text-xs">
            {question.difficulty}
          </Badge>
          <span className="text-xs text-muted-foreground">
            Q{currentIndex + 1}
          </span>
        </div>
        <p className="text-foreground font-medium text-base leading-relaxed">
          {question.questionText}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((option, optIdx) => {
          const isSelected = answers[currentIndex] === BigInt(optIdx);
          return (
            <button
              type="button"
              key={option.slice(0, 20) || String(optIdx)}
              data-ocid={`test.option.${optIdx + 1}`}
              onClick={() =>
                setAnswers((prev) => ({
                  ...prev,
                  [currentIndex]: BigInt(optIdx),
                }))
              }
              className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? "border-primary bg-accent text-accent-foreground shadow-card"
                  : "border-border bg-card hover:border-primary/50 hover:bg-secondary"
              }`}
            >
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {OPTION_LABELS[optIdx]}
              </span>
              <span className="text-sm">{option}</span>
            </button>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <Button
          data-ocid="test.prev.button"
          variant="outline"
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Previous
        </Button>

        {/* Question dots */}
        <div className="flex gap-1.5 flex-wrap justify-center max-w-xs">
          {questions.map((q, i) => (
            <button
              type="button"
              key={String(q.id)}
              data-ocid={`test.q_dot.${i + 1}`}
              onClick={() => setCurrentIndex(i)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i === currentIndex
                  ? "bg-primary"
                  : answers[i] !== undefined
                    ? "bg-success"
                    : "bg-border"
              }`}
            />
          ))}
        </div>

        {currentIndex < totalQuestions - 1 ? (
          <Button
            data-ocid="test.next.button"
            onClick={() =>
              setCurrentIndex((i) => Math.min(totalQuestions - 1, i + 1))
            }
          >
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button
            data-ocid="test.submit.button"
            className="bg-success text-white hover:opacity-90"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
            {isSubmitting ? "Submitting…" : "Submit Test"}
          </Button>
        )}
      </div>
    </main>
  );
}

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  BarChart2,
  BookOpen,
  ChevronDown,
  FolderOpen,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Category, Question, Test, TestAttempt } from "../backend.d";
import {
  useCreateCategory,
  useCreateQuestion,
  useCreateTest,
  useDeleteCategory,
  useDeleteQuestion,
  useDeleteTest,
  useDeleteUserScoreRecord,
  useGetAllCategories,
  useGetAllQuestions,
  useGetAllTestAttempts,
  useGetAllTests,
  useResetAllScores,
  useUpdateCategory,
  useUpdateQuestion,
  useUpdateTest,
} from "../hooks/useQueries";

interface AdminPanelProps {
  categories: Category[];
  tests: Test[];
  questions: Question[];
}

// ---- Category Form ----
function CategoryForm({
  initial,
  categories: _cats,
  onSave,
  onCancel,
  isPending,
}: {
  initial?: Category;
  categories: Category[];
  onSave: (name: string, description: string) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Category Name</Label>
        <Input
          data-ocid="admin.category.name.input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Mathematics"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Description</Label>
        <Textarea
          data-ocid="admin.category.desc.textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description…"
          rows={2}
        />
      </div>
      <DialogFooter>
        <Button
          variant="outline"
          onClick={onCancel}
          data-ocid="admin.category.cancel.button"
        >
          Cancel
        </Button>
        <Button
          onClick={() => onSave(name, description)}
          disabled={isPending || !name}
          data-ocid="admin.category.save.button"
        >
          {isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />} Save
        </Button>
      </DialogFooter>
    </div>
  );
}

// ---- Question Form ----
function QuestionForm({
  initial,
  categories,
  onSave,
  onCancel,
  isPending,
}: {
  initial?: Question;
  categories: Category[];
  onSave: (data: {
    categoryId: bigint;
    questionText: string;
    options: string[];
    correctOptionIndex: bigint;
    difficulty: string;
  }) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [categoryId, setCategoryId] = useState(
    initial ? String(initial.categoryId) : "",
  );
  const [questionText, setQuestionText] = useState(initial?.questionText ?? "");
  const [options, setOptions] = useState<string[]>(
    initial?.options ?? ["", "", "", ""],
  );
  const [correctIdx, setCorrectIdx] = useState(
    initial ? String(initial.correctOptionIndex) : "0",
  );
  const [difficulty, setDifficulty] = useState(initial?.difficulty ?? "Medium");

  const handleOptionChange = (i: number, v: string) =>
    setOptions((prev) => {
      const next = [...prev];
      next[i] = v;
      return next;
    });

  const valid = !!categoryId && !!questionText && options.every(Boolean);

  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger data-ocid="admin.question.category.select">
              <SelectValue placeholder="Select…" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={String(c.id)} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Difficulty</Label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger data-ocid="admin.question.difficulty.select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Easy", "Medium", "Hard"].map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Question Text</Label>
        <Textarea
          data-ocid="admin.question.text.textarea"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Enter the question…"
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label>Options (mark correct)</Label>
        {options.map((opt, i) => (
          <div
            key={["A", "B", "C", "D"][i]}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={() => setCorrectIdx(String(i))}
              data-ocid={`admin.question.correct_option.${i + 1}`}
              className={`w-7 h-7 rounded-full border text-xs font-bold shrink-0 transition-colors ${
                correctIdx === String(i)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary"
              }`}
            >
              {["A", "B", "C", "D"][i]}
            </button>
            <Input
              data-ocid={`admin.question.option_input.${i + 1}`}
              value={opt}
              onChange={(e) => handleOptionChange(i, e.target.value)}
              placeholder={`Option ${["A", "B", "C", "D"][i]}…`}
              className="flex-1"
            />
          </div>
        ))}
        <p className="text-xs text-muted-foreground">
          Click the letter circle to mark the correct answer.
        </p>
      </div>
      <DialogFooter>
        <Button
          variant="outline"
          onClick={onCancel}
          data-ocid="admin.question.cancel.button"
        >
          Cancel
        </Button>
        <Button
          onClick={() =>
            onSave({
              categoryId: BigInt(categoryId),
              questionText,
              options,
              correctOptionIndex: BigInt(correctIdx),
              difficulty,
            })
          }
          disabled={isPending || !valid}
          data-ocid="admin.question.save.button"
        >
          {isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />} Save
        </Button>
      </DialogFooter>
    </div>
  );
}

// ---- Test Form ----
function TestForm({
  initial,
  categories,
  allQuestions,
  onSave,
  onCancel,
  isPending,
}: {
  initial?: Test;
  categories: Category[];
  allQuestions: Question[];
  onSave: (data: {
    title: string;
    categoryId: bigint;
    questionIds: bigint[];
    timeLimitMinutes: bigint;
  }) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [categoryId, setCategoryId] = useState(
    initial ? String(initial.categoryId) : "",
  );
  const [timeLimit, setTimeLimit] = useState(
    initial ? String(initial.timeLimitMinutes) : "30",
  );
  const [selectedQIds, setSelectedQIds] = useState<Set<string>>(
    new Set(initial?.questionIds.map(String) ?? []),
  );

  const filteredQs = categoryId
    ? allQuestions.filter((q) => String(q.categoryId) === categoryId)
    : allQuestions;

  const toggleQ = (id: string) =>
    setSelectedQIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const valid = !!title && !!categoryId && selectedQIds.size > 0;

  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
      <div className="space-y-1.5">
        <Label>Test Title</Label>
        <Input
          data-ocid="admin.test.title.input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Math Fundamentals"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Category</Label>
          <Select
            value={categoryId}
            onValueChange={(v) => {
              setCategoryId(v);
              setSelectedQIds(new Set());
            }}
          >
            <SelectTrigger data-ocid="admin.test.category.select">
              <SelectValue placeholder="Select…" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={String(c.id)} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Time Limit (min)</Label>
          <Input
            data-ocid="admin.test.time.input"
            type="number"
            value={timeLimit}
            onChange={(e) => setTimeLimit(e.target.value)}
            min="1"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Select Questions ({selectedQIds.size} selected)</Label>
        <div className="border border-border rounded-xl overflow-hidden max-h-48 overflow-y-auto">
          {filteredQs.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4">
              No questions in selected category.
            </p>
          ) : (
            filteredQs.map((q, idx) => (
              <label
                key={String(q.id)}
                data-ocid={`admin.test.q_select.${idx + 1}`}
                className={`flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-border last:border-0 hover:bg-secondary transition-colors ${
                  selectedQIds.has(String(q.id)) ? "bg-accent/30" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedQIds.has(String(q.id))}
                  onChange={() => toggleQ(String(q.id))}
                  className="mt-0.5"
                />
                <span className="text-sm text-foreground leading-snug">
                  {q.questionText}
                </span>
              </label>
            ))
          )}
        </div>
      </div>
      <DialogFooter>
        <Button
          variant="outline"
          onClick={onCancel}
          data-ocid="admin.test.cancel.button"
        >
          Cancel
        </Button>
        <Button
          onClick={() =>
            onSave({
              title,
              categoryId: BigInt(categoryId),
              questionIds: [...selectedQIds].map(BigInt),
              timeLimitMinutes: BigInt(timeLimit || "30"),
            })
          }
          disabled={isPending || !valid}
          data-ocid="admin.test.save.button"
        >
          {isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />} Save
        </Button>
      </DialogFooter>
    </div>
  );
}

export default function AdminPanel({
  categories,
  tests,
  questions,
}: AdminPanelProps) {
  const { data: allAttempts = [], isLoading: attemptsLoading } =
    useGetAllTestAttempts();

  // Categories CRUD
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  // Questions CRUD
  const createQuestion = useCreateQuestion();
  const updateQuestion = useUpdateQuestion();
  const deleteQuestion = useDeleteQuestion();

  // Tests CRUD
  const createTest = useCreateTest();
  const updateTest = useUpdateTest();
  const deleteTest = useDeleteTest();
  const deleteUserScoreRecord = useDeleteUserScoreRecord();
  const resetAllScores = useResetAllScores();

  // Dialog state
  const [catDialog, setCatDialog] = useState<{
    open: boolean;
    editing?: Category;
  }>({ open: false });
  const [qDialog, setQDialog] = useState<{ open: boolean; editing?: Question }>(
    { open: false },
  );
  const [testDialog, setTestDialog] = useState<{
    open: boolean;
    editing?: Test;
  }>({ open: false });

  const getCategoryName = (id: bigint) =>
    categories.find((c) => c.id === id)?.name ?? "—";
  const getTestTitle = (id: bigint) =>
    tests.find((t) => t.id === id)?.title ?? String(id);

  // Stats
  const stats = [
    {
      label: "Categories",
      value: categories.length,
      icon: <FolderOpen className="w-5 h-5" />,
    },
    {
      label: "Tests",
      value: tests.length,
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      label: "Questions",
      value: questions.length,
      icon: <BarChart2 className="w-5 h-5" />,
    },
    {
      label: "Attempts",
      value: allAttempts.length,
      icon: <Users className="w-5 h-5" />,
    },
  ];

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage categories, questions, tests, and view results.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-card rounded-xl border border-border shadow-xs p-4 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-accent-foreground">
              {s.icon}
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {s.value}
              </div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="categories" data-ocid="admin.tabs">
        <TabsList className="mb-6">
          <TabsTrigger value="categories" data-ocid="admin.categories.tab">
            Categories
          </TabsTrigger>
          <TabsTrigger value="questions" data-ocid="admin.questions.tab">
            Questions
          </TabsTrigger>
          <TabsTrigger value="tests" data-ocid="admin.tests.tab">
            Tests
          </TabsTrigger>
          <TabsTrigger value="results" data-ocid="admin.results.tab">
            Results
          </TabsTrigger>
          <TabsTrigger value="userscores" data-ocid="admin.userscores.tab">
            User Scores
          </TabsTrigger>
        </TabsList>

        {/* ---- Categories Tab ---- */}
        <TabsContent value="categories" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">
              Categories ({categories.length})
            </h2>
            <Button
              data-ocid="admin.categories.add.button"
              size="sm"
              onClick={() => setCatDialog({ open: true })}
              className="bg-primary text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Category
            </Button>
          </div>
          <div className="space-y-2">
            {categories.length === 0 && (
              <p
                className="text-sm text-muted-foreground py-6 text-center"
                data-ocid="admin.categories.empty_state"
              >
                No categories yet.
              </p>
            )}
            {categories.map((cat, idx) => (
              <div
                key={String(cat.id)}
                data-ocid={`admin.categories.item.${idx + 1}`}
                className="bg-card rounded-xl border border-border p-4 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="font-medium text-foreground">{cat.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {cat.description}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    data-ocid={`admin.categories.edit_button.${idx + 1}`}
                    variant="ghost"
                    size="icon"
                    onClick={() => setCatDialog({ open: true, editing: cat })}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        data-ocid={`admin.categories.delete_button.${idx + 1}`}
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent data-ocid="admin.categories.delete.dialog">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Category?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete &ldquo;{cat.name}&rdquo;.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel data-ocid="admin.categories.delete.cancel_button">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          data-ocid="admin.categories.delete.confirm_button"
                          className="bg-destructive text-destructive-foreground"
                          onClick={() =>
                            deleteCategory.mutate(cat.id, {
                              onSuccess: () =>
                                toast.success("Category deleted"),
                              onError: () => toast.error("Failed to delete"),
                            })
                          }
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ---- Questions Tab ---- */}
        <TabsContent value="questions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">
              Questions ({questions.length})
            </h2>
            <Button
              data-ocid="admin.questions.add.button"
              size="sm"
              onClick={() => setQDialog({ open: true })}
              className="bg-primary text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Question
            </Button>
          </div>
          <div className="space-y-2">
            {questions.length === 0 && (
              <p
                className="text-sm text-muted-foreground py-6 text-center"
                data-ocid="admin.questions.empty_state"
              >
                No questions yet.
              </p>
            )}
            {questions.map((q, idx) => (
              <div
                key={String(q.id)}
                data-ocid={`admin.questions.item.${idx + 1}`}
                className="bg-card rounded-xl border border-border p-4 flex items-start justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground line-clamp-2">
                    {q.questionText}
                  </p>
                  <div className="flex gap-2 mt-1.5 flex-wrap">
                    <Badge variant="secondary" className="text-xs">
                      {getCategoryName(q.categoryId)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {q.difficulty}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    data-ocid={`admin.questions.edit_button.${idx + 1}`}
                    variant="ghost"
                    size="icon"
                    onClick={() => setQDialog({ open: true, editing: q })}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        data-ocid={`admin.questions.delete_button.${idx + 1}`}
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent data-ocid="admin.questions.delete.dialog">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Question?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete this question.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel data-ocid="admin.questions.delete.cancel_button">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          data-ocid="admin.questions.delete.confirm_button"
                          className="bg-destructive text-destructive-foreground"
                          onClick={() =>
                            deleteQuestion.mutate(q.id, {
                              onSuccess: () =>
                                toast.success("Question deleted"),
                              onError: () => toast.error("Failed to delete"),
                            })
                          }
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ---- Tests Tab ---- */}
        <TabsContent value="tests" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">
              Tests ({tests.length})
            </h2>
            <Button
              data-ocid="admin.tests.add.button"
              size="sm"
              onClick={() => setTestDialog({ open: true })}
              className="bg-primary text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Test
            </Button>
          </div>
          <div className="space-y-2">
            {tests.length === 0 && (
              <p
                className="text-sm text-muted-foreground py-6 text-center"
                data-ocid="admin.tests.empty_state"
              >
                No tests yet.
              </p>
            )}
            {tests.map((t, idx) => (
              <div
                key={String(t.id)}
                data-ocid={`admin.tests.item.${idx + 1}`}
                className="bg-card rounded-xl border border-border p-4 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="font-medium text-foreground">{t.title}</div>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    <Badge variant="secondary" className="text-xs">
                      {getCategoryName(t.categoryId)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {t.questionIds.length} questions ·{" "}
                      {String(t.timeLimitMinutes)} min
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    data-ocid={`admin.tests.edit_button.${idx + 1}`}
                    variant="ghost"
                    size="icon"
                    onClick={() => setTestDialog({ open: true, editing: t })}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        data-ocid={`admin.tests.delete_button.${idx + 1}`}
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent data-ocid="admin.tests.delete.dialog">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Test?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete &ldquo;{t.title}&rdquo;.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel data-ocid="admin.tests.delete.cancel_button">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          data-ocid="admin.tests.delete.confirm_button"
                          className="bg-destructive text-destructive-foreground"
                          onClick={() =>
                            deleteTest.mutate(t.id, {
                              onSuccess: () => toast.success("Test deleted"),
                              onError: () => toast.error("Failed to delete"),
                            })
                          }
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ---- Results Tab ---- */}
        <TabsContent value="results" className="space-y-4">
          <h2 className="font-semibold text-foreground">
            User Test Attempts ({allAttempts.length})
          </h2>
          {attemptsLoading ? (
            <div className="space-y-2" data-ocid="admin.results.loading_state">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : allAttempts.length === 0 ? (
            <p
              className="text-sm text-muted-foreground py-6 text-center"
              data-ocid="admin.results.empty_state"
            >
              No attempts yet.
            </p>
          ) : (
            <div className="space-y-2">
              {allAttempts.map((attempt, idx) => {
                const pct =
                  Number(attempt.totalQuestions) > 0
                    ? Math.round(
                        (Number(attempt.score) /
                          Number(attempt.totalQuestions)) *
                          100,
                      )
                    : 0;
                return (
                  <div
                    key={`${String(attempt.testId)}-${String(attempt.timestamp)}-${idx}`}
                    data-ocid={`admin.results.item.${idx + 1}`}
                    className="bg-card rounded-xl border border-border p-4 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-sm text-foreground truncate">
                        {getTestTitle(attempt.testId)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 truncate">
                        {attempt.userName
                          ? attempt.userName
                          : `${attempt.userId.toString().slice(0, 16)}…`}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge
                        variant="outline"
                        className={
                          pct >= 60
                            ? "border-success/40 text-success"
                            : "border-destructive/40 text-destructive"
                        }
                      >
                        {pct}%
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {String(attempt.score)}/{String(attempt.totalQuestions)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
        {/* ---- User Scores Tab ---- */}
        <TabsContent value="userscores" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">
              User Scores ({allAttempts.length})
            </h2>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  data-ocid="admin.userscores.delete_button"
                  variant="destructive"
                  size="sm"
                  disabled={
                    resetAllScores.isPending || allAttempts.length === 0
                  }
                >
                  {resetAllScores.isPending ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-1" />
                  )}
                  Reset All Scores
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent data-ocid="admin.userscores.reset.dialog">
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset All Scores?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all {allAttempts.length} user
                    score records. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel data-ocid="admin.userscores.reset.cancel_button">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    data-ocid="admin.userscores.reset.confirm_button"
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() =>
                      resetAllScores.mutate(undefined, {
                        onSuccess: () =>
                          toast.success("All scores have been reset"),
                        onError: () => toast.error("Failed to reset scores"),
                      })
                    }
                  >
                    Reset All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          {attemptsLoading ? (
            <div
              className="space-y-2"
              data-ocid="admin.userscores.loading_state"
            >
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 rounded-xl" />
              ))}
            </div>
          ) : allAttempts.length === 0 ? (
            <p
              className="text-sm text-muted-foreground py-6 text-center"
              data-ocid="admin.userscores.empty_state"
            >
              No user scores recorded yet.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 text-muted-foreground">
                    <th className="text-left px-4 py-3 font-medium">#</th>
                    <th className="text-left px-4 py-3 font-medium">Name</th>
                    <th className="text-left px-4 py-3 font-medium">Test</th>
                    <th className="text-right px-4 py-3 font-medium">Score</th>
                    <th className="text-right px-4 py-3 font-medium">Date</th>
                    <th className="text-right px-4 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allAttempts.map((attempt, idx) => {
                    const pct =
                      Number(attempt.totalQuestions) > 0
                        ? Math.round(
                            (Number(attempt.score) /
                              Number(attempt.totalQuestions)) *
                              100,
                          )
                        : 0;
                    const date = new Date(
                      Number(attempt.timestamp) / 1_000_000,
                    );
                    return (
                      <tr
                        key={`${String(attempt.timestamp)}-${idx}`}
                        data-ocid={`admin.userscores.item.${idx + 1}`}
                        className="border-t border-border hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3 text-muted-foreground">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground">
                          {attempt.userName || (
                            <span className="text-muted-foreground italic">
                              Unknown
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {getTestTitle(attempt.testId)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Badge
                            variant="outline"
                            className={
                              pct >= 60
                                ? "border-success/40 text-success"
                                : "border-destructive/40 text-destructive"
                            }
                          >
                            {String(attempt.score)}/
                            {String(attempt.totalQuestions)} ({pct}%)
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground text-xs">
                          {date.toLocaleDateString()}{" "}
                          {date.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                data-ocid={`admin.userscores.delete_button.${idx + 1}`}
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                disabled={deleteUserScoreRecord.isPending}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent data-ocid="admin.userscores.delete.dialog">
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Score Record?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the score record
                                  for &ldquo;{attempt.userName || "Unknown"}
                                  &rdquo;. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel data-ocid="admin.userscores.delete.cancel_button">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  data-ocid="admin.userscores.delete.confirm_button"
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() =>
                                    deleteUserScoreRecord.mutate(
                                      {
                                        userId: attempt.userId,
                                        timestamp: attempt.timestamp,
                                      },
                                      {
                                        onSuccess: () =>
                                          toast.success("Score record deleted"),
                                        onError: () =>
                                          toast.error(
                                            "Failed to delete record",
                                          ),
                                      },
                                    )
                                  }
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Category Dialog */}
      <Dialog
        open={catDialog.open}
        onOpenChange={(o) => setCatDialog({ open: o })}
      >
        <DialogContent data-ocid="admin.categories.dialog">
          <DialogHeader>
            <DialogTitle>
              {catDialog.editing ? "Edit Category" : "Add Category"}
            </DialogTitle>
          </DialogHeader>
          <CategoryForm
            initial={catDialog.editing}
            categories={categories}
            isPending={createCategory.isPending || updateCategory.isPending}
            onCancel={() => setCatDialog({ open: false })}
            onSave={(name, description) => {
              if (catDialog.editing) {
                updateCategory.mutate(
                  { id: catDialog.editing.id, name, description },
                  {
                    onSuccess: () => {
                      toast.success("Category updated");
                      setCatDialog({ open: false });
                    },
                    onError: () => toast.error("Failed to update"),
                  },
                );
              } else {
                createCategory.mutate(
                  { name, description },
                  {
                    onSuccess: () => {
                      toast.success("Category created");
                      setCatDialog({ open: false });
                    },
                    onError: () => toast.error("Failed to create"),
                  },
                );
              }
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Question Dialog */}
      <Dialog open={qDialog.open} onOpenChange={(o) => setQDialog({ open: o })}>
        <DialogContent data-ocid="admin.questions.dialog">
          <DialogHeader>
            <DialogTitle>
              {qDialog.editing ? "Edit Question" : "Add Question"}
            </DialogTitle>
          </DialogHeader>
          <QuestionForm
            initial={qDialog.editing}
            categories={categories}
            isPending={createQuestion.isPending || updateQuestion.isPending}
            onCancel={() => setQDialog({ open: false })}
            onSave={(data) => {
              if (qDialog.editing) {
                updateQuestion.mutate(
                  { id: qDialog.editing.id, ...data },
                  {
                    onSuccess: () => {
                      toast.success("Question updated");
                      setQDialog({ open: false });
                    },
                    onError: () => toast.error("Failed to update"),
                  },
                );
              } else {
                createQuestion.mutate(data, {
                  onSuccess: () => {
                    toast.success("Question created");
                    setQDialog({ open: false });
                  },
                  onError: () => toast.error("Failed to create"),
                });
              }
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Test Dialog */}
      <Dialog
        open={testDialog.open}
        onOpenChange={(o) => setTestDialog({ open: o })}
      >
        <DialogContent className="max-w-xl" data-ocid="admin.tests.dialog">
          <DialogHeader>
            <DialogTitle>
              {testDialog.editing ? "Edit Test" : "Add Test"}
            </DialogTitle>
          </DialogHeader>
          <TestForm
            initial={testDialog.editing}
            categories={categories}
            allQuestions={questions}
            isPending={createTest.isPending || updateTest.isPending}
            onCancel={() => setTestDialog({ open: false })}
            onSave={(data) => {
              if (testDialog.editing) {
                updateTest.mutate(
                  { id: testDialog.editing.id, ...data },
                  {
                    onSuccess: () => {
                      toast.success("Test updated");
                      setTestDialog({ open: false });
                    },
                    onError: () => toast.error("Failed to update"),
                  },
                );
              } else {
                createTest.mutate(data, {
                  onSuccess: () => {
                    toast.success("Test created");
                    setTestDialog({ open: false });
                  },
                  onError: () => toast.error("Failed to create"),
                });
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </main>
  );
}

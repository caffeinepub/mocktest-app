import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart2,
  BookOpen,
  ChevronRight,
  Clock,
  FlaskConical,
  Globe,
  Search,
} from "lucide-react";
import { useState } from "react";
import type { Category, Test } from "../backend.d";

interface HomeScreenProps {
  categories: Category[];
  tests: Test[];
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onStartTest: (testId: bigint) => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Math: <BarChart2 className="w-5 h-5" />,
  Mathematics: <BarChart2 className="w-5 h-5" />,
  Science: <FlaskConical className="w-5 h-5" />,
  "General Knowledge": <Globe className="w-5 h-5" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  Math: "bg-blue-100 text-blue-700",
  Mathematics: "bg-blue-100 text-blue-700",
  Science: "bg-green-100 text-green-700",
  "General Knowledge": "bg-orange-100 text-orange-700",
};

function getCategoryIcon(name: string) {
  return CATEGORY_ICONS[name] ?? <BookOpen className="w-5 h-5" />;
}

function getCategoryColor(name: string) {
  return CATEGORY_COLORS[name] ?? "bg-purple-100 text-purple-700";
}

export default function HomeScreen({
  categories,
  tests,
  isLoading,
  searchQuery,
  onSearchChange,
  onStartTest,
}: HomeScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<bigint | null>(null);

  const filteredTests = tests.filter((t) => {
    const matchesSearch = t.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === null || t.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryName = (id: bigint) =>
    categories.find((c) => c.id === id)?.name ?? "Unknown";

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Hero */}
      <section className="rounded-2xl hero-wash p-8 grid md:grid-cols-2 gap-8 items-center overflow-hidden">
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">
            Ready to test your knowledge?
          </h1>
          <p className="text-muted-foreground text-base">
            Choose a category below, pick a test, and challenge yourself with
            timed multiple-choice questions.
          </p>
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                data-ocid="home.search_input"
                placeholder="Search tests…"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 bg-white"
              />
            </div>
          </div>
        </div>
        <div className="hidden md:block rounded-xl overflow-hidden shadow-card max-h-52">
          <img
            src="/assets/generated/hero-students.dim_700x500.jpg"
            alt="Students studying"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Categories */}
      <section>
        <h2 className="text-xl font-bold text-foreground mb-4">
          Browse by Category
        </h2>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <button
              type="button"
              data-ocid="home.category.all.button"
              onClick={() => setSelectedCategory(null)}
              className={`rounded-xl p-4 text-left border transition-all ${
                selectedCategory === null
                  ? "border-primary bg-primary/5 shadow-card-hover"
                  : "border-border bg-card shadow-xs hover:shadow-card"
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-3">
                <BookOpen className="w-5 h-5 text-accent-foreground" />
              </div>
              <div className="font-semibold text-sm text-foreground">
                All Tests
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {tests.length} tests
              </div>
            </button>
            {categories.map((cat, idx) => (
              <button
                type="button"
                key={String(cat.id)}
                data-ocid={`home.category.item.${idx + 1}`}
                onClick={() =>
                  setSelectedCategory(
                    cat.id === selectedCategory ? null : cat.id,
                  )
                }
                className={`rounded-xl p-4 text-left border transition-all ${
                  selectedCategory === cat.id
                    ? "border-primary bg-primary/5 shadow-card-hover"
                    : "border-border bg-card shadow-xs hover:shadow-card"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${getCategoryColor(
                    cat.name,
                  )}`}
                >
                  {getCategoryIcon(cat.name)}
                </div>
                <div className="font-semibold text-sm text-foreground truncate">
                  {cat.name}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {tests.filter((t) => t.categoryId === cat.id).length} tests
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Tests list */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">
            {selectedCategory
              ? `Tests in ${getCategoryName(selectedCategory)}`
              : "All Available Tests"}
          </h2>
          <Badge variant="secondary">{filteredTests.length} tests</Badge>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-36 rounded-xl" />
            ))}
          </div>
        ) : filteredTests.length === 0 ? (
          <div
            data-ocid="home.tests.empty_state"
            className="text-center py-16 text-muted-foreground"
          >
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No tests found</p>
            <p className="text-sm mt-1">
              Try a different category or search term
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTests.map((test, idx) => {
              const catName = getCategoryName(test.categoryId);
              return (
                <Card
                  key={String(test.id)}
                  data-ocid={`home.tests.item.${idx + 1}`}
                  className="shadow-xs hover:shadow-card transition-shadow border-border"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base font-semibold leading-snug">
                        {test.title}
                      </CardTitle>
                      <Badge
                        variant="secondary"
                        className={`text-xs shrink-0 ${getCategoryColor(catName)}`}
                      >
                        {catName}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        {test.questionIds.length} questions
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {String(test.timeLimitMinutes)} min
                      </span>
                    </div>
                    <Button
                      data-ocid={`home.tests.start_button.${idx + 1}`}
                      className="w-full bg-primary text-primary-foreground hover:opacity-90 h-9"
                      onClick={() => onStartTest(test.id)}
                    >
                      Start Test <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

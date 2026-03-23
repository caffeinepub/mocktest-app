import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useActor } from "../hooks/useActor";

interface NameEntryScreenProps {
  testTitle: string;
  onStart: (name: string) => void;
  onBack: () => void;
}

export default function NameEntryScreen({
  testTitle,
  onStart,
  onBack,
}: NameEntryScreenProps) {
  const { actor } = useActor();
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    if (!actor) return;
    actor
      .getCallerUserProfile()
      .then((profile) => {
        if (profile?.name) setName(profile.name);
      })
      .catch(() => {})
      .finally(() => setIsLoadingProfile(false));
  }, [actor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || !actor) return;
    setIsSaving(true);
    try {
      await actor.saveCallerUserProfile({ name: trimmed });
    } catch {
      // non-blocking
    } finally {
      setIsSaving(false);
    }
    onStart(trimmed);
  };

  return (
    <main className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-10">
      <Card
        data-ocid="name_entry.card"
        className="w-full max-w-md shadow-xl border-border"
      >
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3 w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-7 h-7 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Apna Naam Darj Karein
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            <span className="font-medium text-foreground">{testTitle}</span>{" "}
            test shuru karne se pehle
          </p>
        </CardHeader>

        <CardContent className="pt-4">
          {isLoadingProfile ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name-input">Aapka Naam</Label>
                <Input
                  id="name-input"
                  data-ocid="name_entry.input"
                  placeholder="Yahan apna naam likhein..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  className="text-base"
                />
              </div>

              <Button
                data-ocid="name_entry.submit_button"
                type="submit"
                className="w-full text-base font-semibold"
                disabled={!name.trim() || isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Test Shuru Karo 🚀"
                )}
              </Button>

              <Button
                data-ocid="name_entry.cancel_button"
                type="button"
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={onBack}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Wapas Jao
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

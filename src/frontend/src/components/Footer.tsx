import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border mt-16 py-6 text-center text-xs text-muted-foreground">
      <p className="flex items-center justify-center gap-1">
        © {new Date().getFullYear()}. Built with{" "}
        <Heart className="w-3 h-3 text-destructive fill-destructive" /> using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          caffeine.ai
        </a>
      </p>
    </footer>
  );
}

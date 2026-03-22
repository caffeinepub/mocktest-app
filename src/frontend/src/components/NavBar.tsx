import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, LogOut, Search, Shield } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

type Screen = "home" | "test" | "result" | "admin";

interface NavBarProps {
  currentScreen: Screen;
  isAdmin: boolean;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export default function NavBar({
  currentScreen,
  isAdmin,
  onNavigate,
  onLogout,
  searchQuery,
  onSearchChange,
}: NavBarProps) {
  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
        {/* Logo */}
        <button
          type="button"
          onClick={() => onNavigate("home")}
          className="flex items-center gap-2 font-bold text-lg text-primary shrink-0"
          data-ocid="nav.link"
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="hidden sm:block text-navy">PrepMaster</span>
        </button>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1 ml-4">
          <button
            type="button"
            onClick={() => onNavigate("home")}
            data-ocid="nav.home.link"
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              currentScreen === "home"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            Home
          </button>
          {isAdmin && (
            <button
              type="button"
              onClick={() => onNavigate("admin")}
              data-ocid="nav.admin.link"
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                currentScreen === "admin"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Admin Panel
            </button>
          )}
        </nav>

        {/* Mobile nav */}
        {isAdmin && (
          <div className="flex md:hidden items-center gap-1 ml-2">
            <button
              type="button"
              onClick={() => onNavigate("admin")}
              data-ocid="nav.admin.mobile.link"
              className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 ${
                currentScreen === "admin"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Shield className="w-3 h-3" />
              Admin
            </button>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search */}
        <div className="relative hidden sm:block w-48 lg:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-ocid="nav.search_input"
            placeholder="Search tests…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>

        {/* Logout */}
        <Button
          data-ocid="nav.logout.button"
          variant="outline"
          size="sm"
          onClick={onLogout}
          className="flex items-center gap-1.5 text-sm"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}

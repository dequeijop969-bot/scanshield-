import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ScanSearch, History, Home, BookOpen, Diamond } from "lucide-react";
import SettingsMenu from "@/components/SettingsMenu";
import SupportModal from "@/components/SupportModal";

const mainNavItems = [
  { name: "Home", icon: Home, page: "Home" },
  { name: "Analisar", icon: ScanSearch, page: "Analyze" },
  { name: "Histórico", icon: History, page: "History" },
];

const mobileNavItems = [
  { name: "Home", icon: Home, page: "Home" },
  { name: "Analisar", icon: ScanSearch, page: "Analyze" },
  { name: "Histórico", icon: History, page: "History" },
  { name: "Tutorial", icon: BookOpen, page: "Tutorial" },
  { name: "Assinar", icon: Diamond, page: "Premium" },
];

export default function Layout({ children, currentPageName }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
      root.classList.remove("light");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const [supportOpen, setSupportOpen] = useState(false);
  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Left: Logo + Tutorial + Assinar */}
          <div className="flex items-center gap-3">
            <Link to={createPageUrl("Home")} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-foreground/5">
                <img
                  src="https://media.base44.com/images/public/69b21108e661b747169bd2a0/320b791b3_WhatsAppImage2026-03-11at211121.jpg"
                  alt="ScanShield Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-lg font-black tracking-tight text-foreground">
                SCAN<span className="text-foreground/50">SHIELD</span>
              </span>
            </Link>

            <Link
              to={createPageUrl("Tutorial")}
              className={`hidden sm:flex items-center justify-center p-2 rounded-lg transition-all duration-200 ${
                currentPageName === "Tutorial"
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              title="Tutorial"
            >
              <BookOpen className="w-4 h-4" />
            </Link>

            <Link
              to={createPageUrl("Premium")}
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                currentPageName === "Premium"
                  ? "bg-yellow-400 text-black"
                  : "bg-yellow-400/20 text-yellow-400 hover:bg-yellow-400 hover:text-black border border-yellow-400/40"
              }`}
            >
              <Diamond className="w-4 h-4" />
              Assinar
            </Link>
          </div>

          {/* Right: Nav + Theme toggle */}
          <div className="flex items-center gap-1">
            <nav className="hidden sm:flex items-center gap-1">
              {mainNavItems.map((item) => {
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <SettingsMenu theme={theme} onToggleTheme={toggleTheme} />
          </div>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/90 backdrop-blur-xl">
        <div className="flex justify-around py-2">
          {mobileNavItems.map((item) => {
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : ""}`} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main content */}
      <main className="pb-20 sm:pb-0">
        {children}
      </main>

      {/* Footer */}
      <footer className="hidden sm:flex justify-center pb-4">
        <button
          onClick={() => setSupportOpen(true)}
          className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
        >
          Suporte
        </button>
      </footer>

      <SupportModal open={supportOpen} onClose={() => setSupportOpen(false)} />
    </div>
  );
}
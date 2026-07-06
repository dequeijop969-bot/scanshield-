import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { createPageUrl } from "@/utils";
import { ScanSearch, History, Home, BookOpen, Diamond } from "lucide-react";
import SettingsMenu from "@/components/SettingsMenu";
import SupportModal from "@/components/SupportModal";
import { useTheme } from "@/lib/ThemeContext";

const mainNavItems = [
  { name: "Home", icon: Home, page: "Home" },
  { name: "Analisar", icon: ScanSearch, page: "Analyze" },
  { name: "Histórico", icon: History, page: "History" },
  { name: "Tutorial", icon: BookOpen, page: "Tutorial" },
];

const mobileNavItems = [
  { name: "Home", icon: Home, page: "Home" },
  { name: "Analisar", icon: ScanSearch, page: "Analyze" },
  { name: "Histórico", icon: History, page: "History" },
  { name: "Tutorial", icon: BookOpen, page: "Tutorial" },
  { name: "Assinar", icon: Diamond, page: "Premium" },
];

export default function Layout() {
  const location = useLocation();
  const currentPageName = location.pathname.replace("/", "") || "Home";
  const { theme, toggleTheme } = useTheme();
  const [supportOpen, setSupportOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Left: Logo */}
          <Link to={createPageUrl("Home")} className="flex items-center gap-3 flex-shrink-0 group">
            <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-black ring-1 ring-border/60 transition-shadow duration-300 group-hover:ring-foreground/30">
              <img
                src="https://media.base44.com/images/public/69b21108e661b747169bd2a0/320b791b3_WhatsAppImage2026-03-11at211121.jpg"
                alt="ScanShield Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-lg font-black tracking-tight text-foreground">
              SCAN<span className="text-foreground/50">SHIELD</span>
            </span>
          </Link>

          {/* Center: Nav pill */}
          <nav
            aria-label="Navegação principal"
            className="hidden sm:flex items-center gap-0.5 p-1 rounded-full bg-foreground/[0.04] border border-border/60"
          >
            {mainNavItems.map((item) => {
              const isActive = currentPageName === item.page;
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? "text-background"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-foreground"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <item.icon className="relative w-4 h-4" />
                  <span className="relative hidden lg:inline">{item.name}</span>
                  <span className="relative lg:hidden sr-only">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: Assinar + Settings */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              to={createPageUrl("Premium")}
              className={`hidden sm:flex relative overflow-hidden items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                currentPageName === "Premium"
                  ? "bg-yellow-400 text-black shadow-[0_0_20px_rgba(250,204,21,0.35)]"
                  : "bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 hover:bg-yellow-400 hover:text-black hover:border-yellow-400 hover:shadow-[0_0_20px_rgba(250,204,21,0.3)]"
              }`}
            >
              <Diamond className="w-4 h-4" />
              Assinar
            </Link>

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
        <Outlet />
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

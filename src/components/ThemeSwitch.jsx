import React from "react";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";

export default function ThemeSwitch() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className="relative w-16 h-9 rounded-full flex items-center px-1 transition-colors duration-300 bg-foreground/10 border border-border"
      aria-label="Alternar tema"
    >
      <Sun className="w-4 h-4 text-yellow-400 absolute left-1.5" />
      <Moon className="w-4 h-4 text-blue-300 absolute right-1.5" />
      <motion.div
        className="w-7 h-7 rounded-full bg-background shadow-md flex items-center justify-center relative z-10 border border-border"
        animate={{ x: isDark ? 28 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-blue-300" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-yellow-400" />
        )}
      </motion.div>
    </button>
  );
}

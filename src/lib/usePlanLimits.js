import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

// Planos e seus limites
// gratuito: 1 análise, 1 dúvida, sem deepfake, 1 link
// iniciante: 5 análises, 5 dúvidas, sem deepfake, 5 links
// intermediario: 10 análises, 8 dúvidas, com deepfake, 10 links
// pro: 20 análises, 10 dúvidas, com deepfake, 20 links

const STUDENT_KEY = "scanshield_student_mode";

function getLinkAnalysisKey() {
  const now = new Date();
  return `scanshield_link_analyses_${now.getFullYear()}_${now.getMonth()}`;
}

export function getMonthlyLinkCount() {
  try {
    return parseInt(localStorage.getItem(getLinkAnalysisKey()) || "0", 10);
  } catch { return 0; }
}

export function incrementLinkCount() {
  try {
    const key = getLinkAnalysisKey();
    const current = parseInt(localStorage.getItem(key) || "0", 10);
    localStorage.setItem(key, String(current + 1));
  } catch {}
}

export function getPlanLimits(user) {
  // Modo estudante: sem limites
  if (typeof window !== "undefined" && localStorage.getItem(STUDENT_KEY) === "true") {
    return { analyses: Infinity, questions: Infinity, deepfake: true, video: true, plan: "estudante" };
  }

  if (!user) return { analyses: 1, questions: 1, deepfake: false, video: false, linkAnalyses: 1, plan: "gratuito" };

  if (user.is_premium) {
    const plan = (user.plan_name || "").toLowerCase();
    if (plan.includes("pro")) return { analyses: 20, questions: 10, deepfake: true, video: true, linkAnalyses: 10, plan: "pro" };
    if (plan.includes("intermediario") || plan.includes("intermediário")) return { analyses: 10, questions: 8, deepfake: true, video: true, linkAnalyses: 5, plan: "intermediario" };
    return { analyses: 5, questions: 5, deepfake: false, video: false, linkAnalyses: 3, plan: "iniciante" };
  }

  return { analyses: 1, questions: 1, deepfake: false, video: false, linkAnalyses: 1, plan: "gratuito" };
}

export function usePlanLimits() {
  const [user, setUser] = useState(null);
  const [monthlyAnalyses, setMonthlyAnalyses] = useState(0);
  const [monthlyLinkAnalyses, setMonthlyLinkAnalyses] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const u = await base44.auth.me();
        setUser(u);

        // Contar análises do mês atual
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const all = await base44.entities.ScreenAnalysis.filter(
          { created_by: u?.email },
          "-created_date",
          100
        );
        const thisMonth = all.filter(a => a.created_date >= startOfMonth);
        setMonthlyAnalyses(thisMonth.length);
        setMonthlyLinkAnalyses(getMonthlyLinkCount());
      } catch {
        setUser(null);
        setMonthlyAnalyses(0);
      }
      setLoading(false);
    }
    load();
  }, []);

  const limits = getPlanLimits(user);

  return {
    user,
    limits,
    monthlyAnalyses,
    monthlyLinkAnalyses,
    loading,
    canAnalyze: monthlyAnalyses < limits.analyses,
    canUseDeepfake: limits.deepfake,
    canUseVideo: limits.video,
    canAnalyzeLink: monthlyLinkAnalyses < limits.linkAnalyses,
  };
}
import { useState, useEffect, useCallback } from "react";

export const STUDENT_CODE = "zc&t0hieSK9h/|>Z=9w1";
export const STUDENT_KEY = "scanshield_student_mode";
const STUDENT_EVENT = "scanshield:student-mode-changed";

function readStudentMode() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STUDENT_KEY) === "true";
}

/**
 * Hook compartilhado do modo estudante.
 * Sincroniza o estado entre todos os componentes que o usam
 * (menu de configurações, perfil, premium) via evento customizado.
 */
export function useStudentMode() {
  const [isStudent, setIsStudent] = useState(readStudentMode);

  useEffect(() => {
    const sync = () => setIsStudent(readStudentMode());
    window.addEventListener(STUDENT_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(STUDENT_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const activate = useCallback((code) => {
    if (code !== STUDENT_CODE) return false;
    localStorage.setItem(STUDENT_KEY, "true");
    setIsStudent(true);
    window.dispatchEvent(new Event(STUDENT_EVENT));
    return true;
  }, []);

  const deactivate = useCallback(() => {
    localStorage.removeItem(STUDENT_KEY);
    setIsStudent(false);
    window.dispatchEvent(new Event(STUDENT_EVENT));
  }, []);

  return { isStudent, activate, deactivate };
}

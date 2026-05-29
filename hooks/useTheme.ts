"use client";
import { useState, useCallback, useEffect, useRef } from "react";

const STORAGE_KEY = "narravox_theme";
const NIGHT_START = 22; // 22h
const NIGHT_END = 6;    // 6h

function isNightHour(): boolean {
  const h = new Date().getHours();
  return h >= NIGHT_START || h < NIGHT_END;
}

function applyTheme(dark: boolean) {
  document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
}

export function useTheme() {
  const [dark, setDark] = useState(false);
  const [showNightBanner, setShowNightBanner] = useState(false);
  const autoAppliedRef = useRef(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored ? stored === "dark" : prefersDark;
    applyTheme(isDark);
    setDark(isDark);

    // Ativação automática noturna — só se o usuário nunca escolheu explicitamente
    if (!stored && !isDark && isNightHour()) {
      autoAppliedRef.current = true;
      applyTheme(true);
      setDark(true);
      setShowNightBanner(true);
    }
  }, []);

  // Verifica hora a cada minuto para ativar dark mode ao entrar no período noturno
  useEffect(() => {
    const check = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return; // usuário tem preferência explícita — não sobrescrever
      if (isNightHour() && !autoAppliedRef.current) {
        autoAppliedRef.current = true;
        applyTheme(true);
        setDark(true);
        setShowNightBanner(true);
      } else if (!isNightHour() && autoAppliedRef.current) {
        autoAppliedRef.current = false;
        applyTheme(false);
        setDark(false);
      }
    };
    const id = window.setInterval(check, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const toggle = useCallback(() => {
    setDark((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
      applyTheme(next);
      autoAppliedRef.current = false;
      return next;
    });
    setShowNightBanner(false);
  }, []);

  const dismissNightBanner = useCallback(() => setShowNightBanner(false), []);

  return { dark, toggle, showNightBanner, dismissNightBanner };
}

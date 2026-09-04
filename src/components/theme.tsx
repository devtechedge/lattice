import { createContext, useContext, useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

const Ctx = createContext<{ theme: Theme; toggle: () => void }>({ theme: "dark", toggle: () => {} });

function read(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem("lattice-theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  useEffect(() => {
    const t = read();
    setTheme(t);
    document.documentElement.classList.toggle("dark", t === "dark");
  }, []);
  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("lattice-theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };
  return <Ctx.Provider value={{ theme, toggle }}>{children}</Ctx.Provider>;
}

export function useTheme() {
  return useContext(Ctx);
}

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      className="relative grid size-10 shrink-0 place-items-center text-mute hover:text-fg"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span
        className="absolute inset-0 grid place-items-center transition duration-300 ease-out"
        style={{
          opacity: dark ? 1 : 0,
          transform: dark ? "scale(1)" : "scale(0.25)",
          filter: dark ? "blur(0)" : "blur(4px)",
        }}
        aria-hidden="true"
      >
        <Sun className="size-4" />
      </span>
      <span
        className="absolute inset-0 grid place-items-center transition duration-300 ease-out"
        style={{
          opacity: dark ? 0 : 1,
          transform: dark ? "scale(0.25)" : "scale(1)",
          filter: dark ? "blur(4px)" : "blur(0)",
        }}
        aria-hidden="true"
      >
        <Moon className="size-4" />
      </span>
    </button>
  );
}

"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/lib/store/authStore";

export default function AuthHydrator() {
  const hydrate = useAuthStore((s) => s.hydrate);
  
  useEffect(() => { 
    hydrate(); 
    
    // Hydrate theme mode on app load
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") || "dark";
      if (savedTheme === "light") {
        document.documentElement.classList.add("light-mode");
      } else if (savedTheme === "system" && window.matchMedia("(prefers-color-scheme: light)").matches) {
        document.documentElement.classList.add("light-mode");
      } else {
        document.documentElement.classList.remove("light-mode");
      }
    }
  }, [hydrate]);

  return null;
}
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
      
      // Fetch and sync global settings from backend to local cache
      fetch("/api/settings")
        .then(res => res.json())
        .then(data => {
          let updated = false;
          if (data.devise && data.devise !== localStorage.getItem("devise")) {
            localStorage.setItem("devise", data.devise);
            updated = true;
          }
          if (data.formatDate && data.formatDate !== localStorage.getItem("formatDate")) {
            localStorage.setItem("formatDate", data.formatDate);
            updated = true;
          }
          if (updated) {
            window.dispatchEvent(new CustomEvent("settingsUpdated"));
          }
        })
        .catch(err => console.error("Failed to sync settings", err));
    }
  }, [hydrate]);

  return null;
}
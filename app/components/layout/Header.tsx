"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Smartphone, Monitor } from "lucide-react";
import { useUser, USER_OPTIONS } from "@/lib/UserContext";
import { ClockIcon } from "@/app/components/ui/ClockIcon";

export function Header() {
  const pathname = usePathname();
  const isMobile = pathname === "/mobile";
  const { currentUser, setCurrentUser } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResetDemo = async () => {
    setResetting(true);
    try {
      const res = await fetch("/api/demo/reset", { method: "POST" });
      if (res.ok) {
        setMenuOpen(false);
        window.location.reload();
      }
    } finally {
      setResetting(false);
    }
  };

  return (
    <header className={`h-12 bg-white border-b border-neutral-85 flex items-center justify-center ${isMobile ? "px-3" : "px-6"}`}>
      <div className="w-full max-w-[1920px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="p-2 -ml-2 rounded hover:bg-neutral-90 text-primary"
              aria-label="Menü"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <ClockIcon size={24} />
            </button>
            {menuOpen && (
              <ul
                role="menu"
                className="absolute left-0 top-full mt-1 py-1 rounded border border-neutral-85 bg-white shadow-lg min-w-[200px] z-50"
              >
                {USER_OPTIONS.filter((user) => user !== currentUser).map((user) => (
                  <li key={user} role="menuitem">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentUser(user);
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-ink hover:bg-neutral-97 transition-colors"
                    >
                      Wechsle zu {user}
                    </button>
                  </li>
                ))}
                <li role="menuitem" className="border-t border-neutral-90 mt-1 pt-1">
                  <Link
                    href={isMobile ? "/" : "/mobile"}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-ink hover:bg-neutral-97 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    {isMobile ? (
                      <>
                        <Monitor size={16} />
                        Desktop-Ansicht
                      </>
                    ) : (
                      <>
                        <Smartphone size={16} />
                        Mobile-Ansicht
                      </>
                    )}
                  </Link>
                </li>
                <li role="menuitem" className="border-t border-neutral-90 mt-1 pt-1">
                  <button
                    type="button"
                    onClick={handleResetDemo}
                    disabled={resetting}
                    title="Zeiteinträge auf Demo-Daten (Jan–22.2.) zurücksetzen"
                    className="w-full text-left px-4 py-2 text-sm text-ink hover:bg-neutral-97 transition-colors disabled:opacity-60"
                  >
                    {resetting ? "Wird zurückgesetzt…" : "Daten zurücksetzen"}
                  </button>
                </li>
              </ul>
            )}
          </div>
          <h1 className="font-bold truncate text-base text-primary">Leistungserfassung</h1>
        </div>
        <div className="flex items-center justify-end gap-4 shrink-0 text-ink">
          <span style={{ fontSize: 14, fontWeight: 600 }}>{currentUser}</span>
          <span style={{ fontSize: 14, fontWeight: 400 }}>DE ▾</span>
        </div>
      </div>
    </header>
  );
}

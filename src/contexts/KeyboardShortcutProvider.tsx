"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useColorMode } from "@/lib/theme";
import {
  useSearchOverlay,
  type SearchMode,
} from "@/contexts/SearchOverlayContext";
import KeyboardHelpDialog from "@/components/KeyboardHelpDialog";

const G_CHORD_TIMEOUT = 800;

const G_CHORD_ROUTES: Record<string, string> = {
  h: "/",
  m: "/movies",
  t: "/tv",
  p: "/profile",
  a: "/about",
};

function isInputTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

export default function KeyboardShortcutProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { toggleColorMode } = useColorMode();
  const { setSearchOpen, searchOpen, searchMode, setSearchMode } =
    useSearchOverlay();
  const [helpOpen, setHelpOpen] = useState(false);

  const gKeyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (gKeyTimer.current) clearTimeout(gKeyTimer.current);
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // ── Escape (works even in inputs) ──
      if (e.key === "Escape") {
        if (helpOpen) {
          setHelpOpen(false);
          return;
        }
        if (searchOpen) {
          setSearchOpen(false);
          return;
        }
        return;
      }

      // ── Tab in search overlay: toggle mode instead of moving focus ──
      if (e.key === "Tab" && searchOpen) {
        e.preventDefault();
        setSearchMode(searchMode === "movies" ? "tv" : "movies");
        return;
      }

      // ── Alt+M / Alt+T : open search in specific mode (before input guard,
      //     so it works even when the search input is focused) ──
      if (
        (e.key.toLowerCase() === "m" || e.key.toLowerCase() === "t") &&
        e.altKey &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey
      ) {
        e.preventDefault();
        setSearchMode(e.key.toLowerCase() === "m" ? "movies" : "tv");
        setSearchOpen(true);
        return;
      }

      // ── All other shortcuts skip when focus is in an input ──
      if (isInputTarget(e.target)) return;

      // ── g-chord navigation ──
      if (e.key === "g" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (gKeyTimer.current) clearTimeout(gKeyTimer.current);
        gKeyTimer.current = setTimeout(() => {
          gKeyTimer.current = null;
        }, G_CHORD_TIMEOUT);
        return;
      }

      if (gKeyTimer.current) {
        clearTimeout(gKeyTimer.current);
        gKeyTimer.current = null;

        const route = G_CHORD_ROUTES[e.key];
        if (route) {
          e.preventDefault();
          router.push(route);
        }
        return;
      }

      // ── Ctrl+K or / : open search ──
      if (
        (e.key === "k" &&
          (e.ctrlKey || e.metaKey) &&
          !e.shiftKey &&
          !e.altKey) ||
        (e.key === "/" && !e.ctrlKey && !e.metaKey)
      ) {
        e.preventDefault();
        setSearchOpen(true);
        return;
      }

      // ── ? : toggle help dialog ──
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setHelpOpen((prev) => !prev);
        return;
      }

      // ── Ctrl+Alt+T : toggle theme ──
      if (e.key.toLowerCase() === "t" && e.ctrlKey && e.altKey) {
        e.preventDefault();
        toggleColorMode();
        return;
      }

      // ── r key (detail pages and profile only) ──
      if (e.key === "r" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const isDetailPage =
          /^\/movies\/\d+/.test(pathname) || /^\/tv\/\d+/.test(pathname);
        const isProfilePage = pathname === "/profile";

        if (isDetailPage) {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent("shortcut:focus-rating"));
        } else if (isProfilePage) {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent("shortcut:toggle-profile-tab"));
        }
        return;
      }

      // ── w key (detail pages only) ──
      if (e.key === "w" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const isDetailPage =
          /^\/movies\/\d+/.test(pathname) || /^\/tv\/\d+/.test(pathname);
        if (isDetailPage) {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent("shortcut:focus-review"));
        }
        return;
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    router,
    pathname,
    toggleColorMode,
    setSearchOpen,
    searchOpen,
    helpOpen,
    searchMode,
    setSearchMode,
  ]);

  return (
    <>
      {children}
      <KeyboardHelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}

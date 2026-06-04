"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Movie, Tv, Search, AccountCircle } from "@mui/icons-material";
import { useSession, signOut } from "next-auth/react";

import { DarkMode, LightMode } from "@mui/icons-material";
import { useColorMode } from "@/lib/theme";
import { useSearchOverlay } from "@/contexts/SearchOverlayContext";
import type { SearchMode } from "@/contexts/SearchOverlayContext";

export function ThemeToggle() {
  const { mode, toggleColorMode } = useColorMode();

  return (
    <button
      onClick={toggleColorMode}
      className="p-2 rounded-md transition-colors"
      style={{
        color: "var(--header-text)",
        backgroundColor: "transparent",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "var(--header-hover-text)";
        e.currentTarget.style.backgroundColor = "var(--header-hover-bg)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "var(--header-text)";
        e.currentTarget.style.backgroundColor = "transparent";
      }}
      aria-label="Toggle theme"
    >
      {mode === "dark" ? <LightMode /> : <DarkMode />}
    </button>
  );
}

export default function Header() {
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const isLoggedIn = status === "authenticated";
  const { searchOpen, setSearchOpen, searchMode, setSearchMode } =
    useSearchOverlay();

  function submitSearch() {
    const q = query.trim();
    if (!q) return;
    const path =
      searchMode === "movies"
        ? `/movies?title=${encodeURIComponent(q)}`
        : `/tv?title=${encodeURIComponent(q)}`;
    setSearchOpen(false);
    setQuery("");
    router.push(path);
  }

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [menuOpen]);

  const headerLinkClass =
    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors";
  const headerIconClass = "p-2 transition-colors";

  return (
    <>
      <header
        className="sticky top-0 z-50 flex items-center gap-4 px-4 h-14 border-b"
        style={{
          backgroundColor: "var(--header-bg)",
          color: "var(--header-text)",
          borderColor: "var(--header-border)",
        }}
      >
        {/* Logo */}
        <a
          href="/"
          className="flex items-center gap-2 font-bold text-lg tracking-tight shrink-0 mr-2 no-underline"
          style={{ color: "var(--header-text)" }}
        >
          <span className="text-amber-400">Media</span>Rate
        </a>

        {/* Navigation */}
        <nav className="hidden sm:flex items-center gap-1">
          <a
            href="/movies"
            className={headerLinkClass}
            style={{ color: "var(--header-text)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--header-hover-text)";
              e.currentTarget.style.backgroundColor = "var(--header-hover-bg)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--header-text)";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <Movie fontSize="small" />
            Movies
          </a>
          <a
            href="/tv"
            className={headerLinkClass}
            style={{ color: "var(--header-text)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--header-hover-text)";
              e.currentTarget.style.backgroundColor = "var(--header-hover-bg)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--header-text)";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <Tv fontSize="small" />
            TV Shows
          </a>
          <a
            href="/about"
            className={headerLinkClass}
            style={{ color: "var(--header-text)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--header-hover-text)";
              e.currentTarget.style.backgroundColor = "var(--header-hover-bg)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--header-text)";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            About
          </a>
        </nav>

        {/* Mobile nav icons */}
        <div className="flex sm:hidden items-center gap-1">
          <a
            href="/movies"
            className={headerIconClass}
            style={{ color: "var(--header-text)" }}
            aria-label="Movies"
          >
            <Movie fontSize="small" />
          </a>
          <a
            href="/tv"
            className={headerIconClass}
            style={{ color: "var(--header-text)" }}
            aria-label="TV Shows"
          >
            <Tv fontSize="small" />
          </a>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search */}
        <button
          onClick={() => setSearchOpen(true)}
          className={headerIconClass + " rounded-md"}
          style={{ color: "var(--header-text)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--header-hover-text)";
            e.currentTarget.style.backgroundColor = "var(--header-hover-bg)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--header-text)";
            e.currentTarget.style.backgroundColor = "transparent";
          }}
          aria-label="Search"
        >
          <Search />
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Profile */}
        {isLoggedIn ? (
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className={
                headerIconClass + " flex items-center gap-1.5 rounded-md"
              }
              style={{ color: "var(--header-text)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--header-hover-text)";
                e.currentTarget.style.backgroundColor =
                  "var(--header-hover-bg)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--header-text)";
                e.currentTarget.style.backgroundColor = "transparent";
              }}
              aria-label="Profile menu"
            >
              <AccountCircle />
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 top-full mt-1 w-44 rounded-md shadow-lg overflow-hidden border"
                style={{
                  backgroundColor: "var(--dropdown-bg)",
                  borderColor: "var(--dropdown-border)",
                }}
              >
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full px-4 py-2.5 text-sm transition-colors no-underline"
                  style={{ color: "var(--dropdown-text)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "var(--dropdown-hover-bg)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  View Profile
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: pathname })}
                  className="flex w-full px-4 py-2.5 text-sm transition-colors"
                  style={{
                    color: "var(--dropdown-text)",
                    borderTop: "1px solid var(--dropdown-divider)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "var(--dropdown-hover-bg)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href={`/sign-in?callbackUrl=${encodeURIComponent(pathname)}`}
            className={headerLinkClass + " no-underline"}
            style={{ color: "var(--header-text)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--header-hover-text)";
              e.currentTarget.style.backgroundColor = "var(--header-hover-bg)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--header-text)";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
            aria-label="Sign in"
          >
            <AccountCircle fontSize="small" />
            Sign In
          </Link>
        )}
      </header>

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 top-14 z-50">
          <div
            className="absolute inset-0 backdrop-blur-sm"
            style={{ backgroundColor: "var(--search-overlay-bg)" }}
            onClick={() => setSearchOpen(false)}
          />
          <div className="relative flex flex-col items-center pt-12 px-6">
            <div className="w-full max-w-lg">
              <div
                className="flex items-center gap-2 rounded-xl overflow-hidden ring-1 ring-[var(--card-border)] focus-within:ring-amber-400 transition-shadow"
                style={{ backgroundColor: "var(--card-bg)" }}
              >
                <Search
                  className="ml-4"
                  style={{ color: "var(--text-secondary)", fontSize: 22 }}
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitSearch();
                  }}
                  placeholder={`Search ${searchMode === "movies" ? "movies" : "TV shows"}...`}
                  className="flex-1 py-3.5 px-4 bg-transparent text-base outline-none"
                  style={{
                    color: "var(--foreground)",
                  }}
                />
                <button
                  onClick={submitSearch}
                  className="bg-amber-400 px-5 py-3.5 text-sm font-semibold text-black hover:bg-amber-500 transition-colors rounded-xl ml-[-4px]"
                >
                  Search
                </button>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setSearchMode("movies")}
                  className="flex items-center gap-2 flex-1 justify-center py-2.5 rounded-lg text-sm font-medium transition-colors"
                  style={
                    searchMode === "movies"
                      ? {
                          backgroundColor: "var(--primary-color)",
                          color: "var(--primary-foreground)",
                        }
                      : {
                          backgroundColor: "var(--search-mode-btn-bg)",
                          color: "var(--search-mode-btn-text)",
                        }
                  }
                  onMouseEnter={(e) => {
                    if (searchMode !== "movies") {
                      e.currentTarget.style.color =
                        "var(--search-mode-btn-hover-text)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (searchMode !== "movies") {
                      e.currentTarget.style.color =
                        "var(--search-mode-btn-text)";
                    }
                  }}
                >
                  <Movie style={{ fontSize: 18 }} />
                  Movies
                </button>
                <button
                  onClick={() => setSearchMode("tv")}
                  className="flex items-center gap-2 flex-1 justify-center py-2.5 rounded-lg text-sm font-medium transition-colors"
                  style={
                    searchMode === "tv"
                      ? {
                          backgroundColor: "var(--primary-color)",
                          color: "var(--primary-foreground)",
                        }
                      : {
                          backgroundColor: "var(--search-mode-btn-bg)",
                          color: "var(--search-mode-btn-text)",
                        }
                  }
                  onMouseEnter={(e) => {
                    if (searchMode !== "tv") {
                      e.currentTarget.style.color =
                        "var(--search-mode-btn-hover-text)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (searchMode !== "tv") {
                      e.currentTarget.style.color =
                        "var(--search-mode-btn-text)";
                    }
                  }}
                >
                  <Tv style={{ fontSize: 18 }} />
                  TV Shows
                </button>
              </div>
              <p
                className="text-sm text-center mt-3"
                style={{ color: "var(--search-hint-text)" }}
              >
                Press Enter to search or click the button
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Movie, Tv, Search, AccountCircle } from "@mui/icons-material";
import { useSession, signOut } from "next-auth/react";

type SearchMode = "movies" | "tv";

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchMode, setSearchMode] = useState<SearchMode>("movies");
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { status } = useSession();
  const router = useRouter();
  const isLoggedIn = status === "authenticated";

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

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setSearchOpen(false);
    }
    if (searchOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
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

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center gap-4 px-4 h-14 bg-zinc-950 text-zinc-100 border-b border-zinc-800">
        {/* Logo */}
        <a
          href="/"
          className="flex items-center gap-2 font-bold text-lg tracking-tight shrink-0 mr-2"
        >
          <span className="text-amber-400">Media</span>Rate
        </a>

        {/* Navigation */}
        <nav className="hidden sm:flex items-center gap-1">
          <a
            href="/movies"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <Movie fontSize="small" />
            Movies
          </a>
          <a
            href="/tv"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <Tv fontSize="small" />
            TV Shows
          </a>
        </nav>

        {/* Mobile nav icons */}
        <div className="flex sm:hidden items-center gap-1">
          <a
            href="/movies"
            className="p-2 text-zinc-300 hover:text-white"
            aria-label="Movies"
          >
            <Movie fontSize="small" />
          </a>
          <a
            href="/tv"
            className="p-2 text-zinc-300 hover:text-white"
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
          className="p-2 rounded-md text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
          aria-label="Search"
        >
          <Search />
        </button>

        {/* Profile */}
        {isLoggedIn ? (
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-1.5 p-2 rounded-md text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
              aria-label="Profile menu"
            >
              <AccountCircle />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 rounded-md bg-zinc-800 border border-zinc-700 shadow-lg overflow-hidden">
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full px-4 py-2.5 text-sm text-zinc-200 hover:bg-zinc-700 transition-colors"
                >
                  View Profile
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex w-full px-4 py-2.5 text-sm text-zinc-200 hover:bg-zinc-700 transition-colors border-t border-zinc-700"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/sign-in"
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-md text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
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
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
          />
          <div className="relative flex flex-col items-center pt-12 px-6">
            <div className="w-full max-w-lg">
              <div className="flex items-center gap-2 bg-zinc-800 rounded-xl overflow-hidden ring-1 ring-zinc-700 focus-within:ring-amber-400 transition-shadow">
                <Search
                  className="ml-4 text-zinc-500"
                  style={{ fontSize: 22 }}
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
                  className="flex-1 py-3.5 pr-4 bg-transparent text-base text-white placeholder-zinc-500 outline-none"
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setSearchMode("movies")}
                  className={`flex items-center gap-2 flex-1 justify-center py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    searchMode === "movies"
                      ? "bg-amber-400 text-black"
                      : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Movie style={{ fontSize: 18 }} />
                  Movies
                </button>
                <button
                  onClick={() => setSearchMode("tv")}
                  className={`flex items-center gap-2 flex-1 justify-center py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    searchMode === "tv"
                      ? "bg-amber-400 text-black"
                      : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Tv style={{ fontSize: 18 }} />
                  TV Shows
                </button>
              </div>
              <p className="text-xs text-zinc-600 text-center mt-3">
                Press Enter to search
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { createContext, useContext, useState } from "react";

export type SearchMode = "movies" | "tv";

interface SearchOverlayContextValue {
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  searchMode: SearchMode;
  setSearchMode: (mode: SearchMode) => void;
}

const SearchOverlayContext = createContext<SearchOverlayContextValue>({
  searchOpen: false,
  setSearchOpen: () => {},
  searchMode: "movies",
  setSearchMode: () => {},
});

export function useSearchOverlay() {
  return useContext(SearchOverlayContext);
}

export function SearchOverlayProvider({ children }: { children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchMode, setSearchMode] = useState<SearchMode>("movies");

  return (
    <SearchOverlayContext.Provider
      value={{ searchOpen, setSearchOpen, searchMode, setSearchMode }}
    >
      {children}
    </SearchOverlayContext.Provider>
  );
}

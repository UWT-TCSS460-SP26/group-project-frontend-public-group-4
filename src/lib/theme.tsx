'use client';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import { useState, createContext, useContext, useMemo, useEffect } from 'react';

const ColorModeContext = createContext({ 
    toggleColorMode: () => {},
    mode: 'dark' as 'light' | 'dark'
});

export function useColorMode() {
    return useContext(ColorModeContext);
}

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
    const [mode, setMode] = useState<'light' | 'dark'>('dark');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('colorMode') as 'light' | 'dark' | null;
        if (stored) setMode(stored);
        document.documentElement.setAttribute('data-theme', stored ?? 'dark');
        setMounted(true);
    }, []);

    const toggleColorMode = useMemo(() => () => setMode(prev => {
        const next = prev === 'light' ? 'dark' : 'light';
        localStorage.setItem('colorMode', next);
        document.documentElement.setAttribute('data-theme', next);
        return next;
    }), []);

    const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);

    if (!mounted) return null;

    return (
        <ColorModeContext.Provider value={{ toggleColorMode, mode }}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
}
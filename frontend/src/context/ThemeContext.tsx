import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark"

// Defines the theme data and functions available through context.
interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

// Creates a context for sharing theme data across the application.
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Reads the saved theme, ignoring invalid values, and falls back to the OS preference.
const getInitialTheme = (): Theme => {
    const saved = localStorage.getItem("theme")
    if (saved === "light" || saved === "dark") return saved
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

// Provides theme state and theme functions to child components.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>(getInitialTheme)

    // Applies the theme class to <html> and saves it whenever the theme changes.
    useEffect(() => {
        const root = window.document.documentElement
        root.classList.remove("light", "dark")
        root.classList.add(theme)
        localStorage.setItem("theme", theme)
    }, [theme])

    // Toggles between light and dark theme.
    const toggleTheme = () => {
        setTheme((prev) => (prev === "light" ? "dark" : "light"))
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

// Provides access to the theme context in components.
export function useTheme() {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error("useTheme must be used within ThemeProvider")
    }
    return context
}
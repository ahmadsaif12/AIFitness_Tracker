import {createContext, useContext, useEffect, useState} from "react"

// Defines the theme data and functions available through context.
interface ThemeContextType {
    theme: String;
    toggleTheme: () =>void;
}
// Creates a context for sharing theme data across the application.
const ThemeContext = createContext<ThemeContextType | undefined>
(undefined);

// Provides theme state and theme functions to child components.
export function ThemeProvider({children}: {children:React.ReactNode}) {
    const [theme, setTheme]= useState(()=>localStorage.getItem('theme') || (window.matchMedia("(prefers-color-scheme: dark)").matches ?"dark" :"light"));
    
    // Updates the theme when state changes.
    useEffect(()=>{
      const root = window.document.documentElement;
      root.classList.remove('light','dark');
      root.classList.add(theme)
      localStorage.setItem('theme', theme)
    },[theme])

    // Toggles between light and dark theme.
    const toggleTheme =()=>{
        setTheme((prev)=>(prev === "light"? "dark" :"light"))
    }

    return <ThemeContext.Provider value={{theme,toggleTheme}}>
        {children}
    </ThemeContext.Provider>
}

// Provides access to the theme context in components.
export function useTheme(){
    const context = useContext(ThemeContext)
    if(context === undefined){
        throw new Error('usetheme must be used within themeProvider')
    }
    return context;
}


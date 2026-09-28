import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import type {
    ActivityEntry,
    AppContextType,
    Credentials,
    FoodEntry,
    User,
} from "../types";

import mockApi from "../assets/mockApi";

// Creates the application context with the initial state.
const AppContext = createContext<AppContextType>({
    user: null,
    setUser: () => {},
    login: async () => {},
    signup: async () => {},
    fetchUser: async () => {},
    isUserFetched: false,
    logout: () => {},
    onboardingCompleted: false,
    setOnboardingCompleted: () => {},
    allFoodLogs: [],
    setAllFoodLogs: () => {},
    allActivityLogs: [],
    setAllActivityLogs: () => {},
});

// Provides application data and functions to child components.
export const AppProvider = ({ children }: { children: React.ReactNode }) => {
    const navigate = useNavigate();

    const [user, setUser] = useState<User>(null);
    const [isUserFetched, setIsUserFetched] = useState(false);
    const [onboardingCompleted, setOnboardingCompleted] = useState(false);
    const [allFoodLogs, setAllFoodLogs] = useState<FoodEntry[]>([]);
    const [allActivityLogs, setAllActivityLogs] = useState<ActivityEntry[]>([]);

    // Registers a new user and saves the authentication token.
    const signup = async (credentials: Credentials) => {
        const { data } = await mockApi.auth.register(credentials);

        setUser({ ...data.user, token: data.jwt });

        if (data?.user?.age && data?.user?.weight && data?.user?.goal) {
            setOnboardingCompleted(true);
        }

        localStorage.setItem("token", data.jwt);
    };

    // Logs in the user and saves the authentication token.
    const login = async (credentials: Credentials) => {
        const { data } = await mockApi.auth.login(credentials);

        setUser({ ...data.user, token: data.jwt });

        if (data?.user?.age && data?.user?.weight && data?.user?.goal) {
            setOnboardingCompleted(true);
        }

        localStorage.setItem("token", data.jwt);
    };

    // Fetches the current user using the authentication token.
    const fetchUser = async (token: string) => {
        try {
            const { data } = await mockApi.user.me();

            setUser({ ...data, token });

            if (data?.age && data?.weight && data?.goal) {
                setOnboardingCompleted(true);
            }
        } catch (error) {
            localStorage.removeItem("token");
            setUser(null);
        } finally {
            setIsUserFetched(true);
        }
    };

    // Logs out the user and redirects to the login page.
    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        setOnboardingCompleted(false);
        navigate("/login");
    };

    const value: AppContextType = {
        user,
        setUser,
        login,
        signup,
        fetchUser,
        isUserFetched,
        logout,
        onboardingCompleted,
        setOnboardingCompleted,
        allFoodLogs,
        setAllFoodLogs,
        allActivityLogs,
        setAllActivityLogs,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

// Provides access to the application context.
export const useAppContext = () => useContext(AppContext);

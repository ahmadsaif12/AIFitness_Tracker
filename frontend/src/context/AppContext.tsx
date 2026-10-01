import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import type {
    ActivityEntry,
    AppContextType,
    Credentials,
    FoodEntry,
    User,
} from "../types";

import strapiApi from "../services/strapiApi";

// Creates the application context with the initial state.
const normalizeUser = (user: Partial<User> | null | undefined, token: string): User => {
    if (!user) return null;

    const id = String(user.id ?? "");
    const email = String(user.email ?? "");
    const username = String(user.username ?? "");

    if (!id || !email || !username) {
        return null;
    }

    return {
        ...user,
        id,
        email,
        username,
        token,
    } as User;
};

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
export const AppProvider = ({ children }: { children: ReactNode }) => {
    const navigate = useNavigate();

    const [user, setUser] = useState<User>(null);
    const [isUserFetched, setIsUserFetched] = useState(false);
    const [onboardingCompleted, setOnboardingCompleted] = useState(false);
    const [allFoodLogs, setAllFoodLogs] = useState<FoodEntry[]>([]);
    const [allActivityLogs, setAllActivityLogs] = useState<ActivityEntry[]>([]);

    const loadUserLogs = useCallback(async () => {
        const [foodResult, activityResult] = await Promise.allSettled([
            strapiApi.foodLogs.list(),
            strapiApi.activityLogs.list(),
        ]);

        setAllFoodLogs(foodResult.status === "fulfilled" ? foodResult.value.data : []);
        setAllActivityLogs(activityResult.status === "fulfilled" ? activityResult.value.data : []);
    }, []);

    const signup = async (credentials: Credentials) => {
        const { data } = await strapiApi.auth.register(credentials);

        setUser(normalizeUser(data.user, data.jwt));
        localStorage.setItem("token", data.jwt);
        await loadUserLogs();

        const hasProfile = Boolean(data?.user?.age || data?.user?.weight || data?.user?.goal);
        setOnboardingCompleted(hasProfile);
    };

    const login = async (credentials: Credentials) => {
        const { data } = await strapiApi.auth.login(credentials);

        setUser(normalizeUser(data.user, data.jwt));
        localStorage.setItem("token", data.jwt);
        await loadUserLogs();

        const hasProfile = Boolean(data?.user?.age || data?.user?.weight || data?.user?.goal);
        setOnboardingCompleted(hasProfile);
    };

    const fetchUser = useCallback(async (token: string) => {
        if (!token) {
            setUser(null);
            setIsUserFetched(true);
            return;
        }

        try {
            const { data } = await strapiApi.user.me();

            setUser(normalizeUser(data, token));
            await loadUserLogs();

            const hasProfile = Boolean(data?.age || data?.weight || data?.goal);
            setOnboardingCompleted(hasProfile);
        } catch (error) {
            localStorage.removeItem("token");
            setUser(null);
            setOnboardingCompleted(false);
        } finally {
            setIsUserFetched(true);
        }
    }, [loadUserLogs]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            void fetchUser(token);
            return;
        }

        setUser(null);
        setOnboardingCompleted(false);
        setIsUserFetched(true);
    }, [fetchUser]);

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        setOnboardingCompleted(false);
        setAllFoodLogs([]);
        setAllActivityLogs([]);
        navigate("/login", { replace: true });
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

export const useAppContext = () => useContext(AppContext);

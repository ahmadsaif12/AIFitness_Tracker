import type { ActivityEntry, FoodEntry, User } from "../types";

const API_BASE = (import.meta.env.VITE_STRAPI_API_URL ?? "http://localhost:1337").replace(/\/$/, "");

const getToken = () => localStorage.getItem("token") ?? "";

const toDateValue = (value: unknown): string => {
  if (!value) {
    return new Date().toISOString().split("T")[0];
  }

  if (typeof value === "number") {
    return new Date(value).toISOString().split("T")[0];
  }

  if (typeof value === "string") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().split("T")[0];
    }
  }

  return new Date().toISOString().split("T")[0];
};

const normalizeFoodEntry = (entry: any): FoodEntry => {
  const source = entry?.attributes ?? entry ?? {};
  const id = Number(source.id ?? entry?.id ?? Date.now());
  const documentId = String(source.documentId ?? source.document_id ?? entry?.documentId ?? entry?.document_id ?? `${id}`);
  const createdAt = source.createdAt ?? source.created_at ?? new Date().toISOString();
  const name = String(source.name ?? "Untitled food");
  const mealType = (source.mealType ?? source.meal_type ?? "breakfast") as FoodEntry["mealType"];

  return {
    id,
    documentId,
    name,
    calories: Number(source.calories ?? 0),
    mealType,
    date: toDateValue(createdAt),
    createdAt,
  };
};

const normalizeActivityEntry = (entry: any): ActivityEntry => {
  const source = entry?.attributes ?? entry ?? {};
  const id = Number(source.id ?? entry?.id ?? Date.now());
  const documentId = String(source.documentId ?? source.document_id ?? entry?.documentId ?? entry?.document_id ?? `${id}`);
  const createdAt = source.createdAt ?? source.created_at ?? new Date().toISOString();

  return {
    id,
    documentId,
    name: String(source.name ?? "Activity"),
    duration: Number(source.duration ?? 0),
    calories: Number(source.calories ?? 0),
    date: toDateValue(createdAt),
    createdAt,
  };
};

async function apiRequest<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(options.headers ?? {});

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = payload?.error?.message || payload?.message || payload?.error || "Request failed";
    throw new Error(message);
  }

  return payload as T;
}

const strapiApi = {
  auth: {
    login: async (credentials: { email: string; password: string }) => {
      const payload = await apiRequest<{ jwt: string; user: User }>(
        "/api/auth/local",
        {
          method: "POST",
          body: JSON.stringify({
            identifier: credentials.email,
            password: credentials.password,
          }),
        }
      );

      return { data: payload };
    },
    register: async (credentials: { username?: string; email: string; password: string }) => {
      const payload = await apiRequest<{ jwt: string; user: User }>(
        "/api/auth/local/register",
        {
          method: "POST",
          body: JSON.stringify({
            username: credentials.username || credentials.email.split("@")[0],
            email: credentials.email,
            password: credentials.password,
          }),
        }
      );

      return { data: payload };
    },
  },

  user: {
    me: async () => {
      const token = getToken();
      const payload = await apiRequest<User>("/api/users/me", { method: "GET" }, token);
      return { data: payload };
    },
    update: async (id: string, updates: Record<string, unknown>) => {
      const token = getToken();
      const payload = await apiRequest<User>(
        `/api/users/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(updates),
        },
        token
      );
      return { data: payload };
    },
  },

  foodLogs: {
    list: async () => {
      const token = getToken();
      const payload = await apiRequest<{ data: any[] }>(
        "/api/food-logs?sort[0]=createdAt:desc",
        { method: "GET" },
        token
      );
      return { data: (payload.data ?? []).map(normalizeFoodEntry) };
    },
    create: async (payload: { data: Record<string, unknown> }) => {
      const token = getToken();
      const response = await apiRequest<{ data: any }>(
        "/api/food-logs",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
        token
      );
      return { data: normalizeFoodEntry(response.data) };
    },
    delete: async (documentId: string) => {
      const token = getToken();
      await apiRequest<{ data?: { id: string } }>(
        `/api/food-logs/${documentId}`,
        { method: "DELETE" },
        token
      );
      return { data: { id: documentId } };
    },
  },

  activityLogs: {
    list: async () => {
      const token = getToken();
      const payload = await apiRequest<{ data: any[] }>(
        "/api/activity-logs?sort[0]=createdAt:desc",
        { method: "GET" },
        token
      );
      return { data: (payload.data ?? []).map(normalizeActivityEntry) };
    },
    create: async (payload: { data: Record<string, unknown> }) => {
      const token = getToken();
      const response = await apiRequest<{ data: any }>(
        "/api/activity-logs",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
        token
      );
      return { data: normalizeActivityEntry(response.data) };
    },
    delete: async (documentId: string) => {
      const token = getToken();
      await apiRequest<{ data?: { id: string } }>(
        `/api/activity-logs/${documentId}`,
        { method: "DELETE" },
        token
      );
      return { data: { id: documentId } };
    },
  },

  imageAnalysis: {
    analyze: async (formData: FormData) => {
      const token = getToken();
      const headers = new Headers();

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      const response = await fetch(`${API_BASE}/api/image-analyze`, {
        method: "POST",
        body: formData,
        headers,
      });

      const text = await response.text();
      const payload = text ? JSON.parse(text) : null;

      if (!response.ok) {
        const message =
          payload?.details ??
          payload?.error?.details ??
          payload?.error?.message ??
          payload?.message ??
          payload?.error ??
          "Image analysis failed";
        throw new Error(String(message));
      }

      const result = payload?.data?.result ?? payload?.result ?? payload?.data ?? payload;
      return { data: result };
    },
  },
};

export default strapiApi;

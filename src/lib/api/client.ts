import { API_BASE_URL } from "./config";

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
  errors?: unknown;
};

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function resolveUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (API_BASE_URL) return `${API_BASE_URL}${path}`;
  // Server components / RSC: relative fetch has no host — hit the API directly.
  if (typeof window === "undefined") {
    const serverBase = (
      process.env.API_BASE_URL ?? "http://localhost:8000"
    ).replace(/\/$/, "");
    return `${serverBase}${path}`;
  }
  // Browser: same-origin `/api/*` → Next rewrite to the backend.
  return path;
}

function extractMessage(body: ApiResponse<unknown>, fallback: string): string {
  if (typeof body.message === "string" && body.message.trim()) {
    return body.message;
  }
  if (typeof body.error === "string" && body.error.trim()) {
    return body.error;
  }
  if (Array.isArray(body.errors)) {
    const parts = body.errors
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && "message" in item) {
          const message = (item as { message?: unknown }).message;
          return typeof message === "string" ? message : null;
        }
        return null;
      })
      .filter((part): part is string => Boolean(part));
    if (parts.length) return parts.join(". ");
  }
  return fallback;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T> & { message: string }> {
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  let response: Response;
  try {
    response = await fetch(resolveUrl(path), {
      ...options,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...options.headers,
      },
    });
  } catch {
    throw new ApiError(
      "Unable to reach the server. Please check your connection and try again.",
      0
    );
  }

  let body: ApiResponse<T> = { success: false };
  try {
    body = (await response.json()) as ApiResponse<T>;
  } catch {
    /* non-JSON response */
  }

  const message = extractMessage(
    body,
    response.ok
      ? "Request completed."
      : "Something went wrong. Please try again."
  );

  if (!response.ok || body.success === false) {
    throw new ApiError(message, response.status, body.data ?? body.errors);
  }

  return { ...body, message };
}

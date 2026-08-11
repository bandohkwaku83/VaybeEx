import { API_BASE_URL } from "./config";

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  error?: string;
  code?: string;
  data?: T;
  errors?: unknown;
};

export class ApiError extends Error {
  status: number;
  code?: string;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.code = code;
  }
}

function extractCode(body: ApiResponse<unknown>): string | undefined {
  if (typeof body.code === "string" && body.code.trim()) {
    return body.code.trim();
  }
  if (body.data && typeof body.data === "object" && !Array.isArray(body.data)) {
    const nested = (body.data as { code?: unknown }).code;
    if (typeof nested === "string" && nested.trim()) return nested.trim();
  }
  return undefined;
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

  const code = extractCode(body);

  if (!response.ok || body.success === false) {
    throw new ApiError(message, response.status, body.data ?? body.errors, code);
  }

  return { ...body, message, code };
}

import axios from "axios";

export interface ParsedApiError {
  message: string;
  code?: string;
  status?: number;
  fieldErrors: Record<string, string>;
}

interface ApiErrorBody {
  error?: {
    code?: string;
    message?: string;
    details?: Record<string, string>;
  };
}

// Turns any thrown value into something the UI can show.
export function parseApiError(err: unknown): ParsedApiError {
  if (axios.isAxiosError<ApiErrorBody>(err)) {
    if (!err.response) {
      return {
        message: "Unable to reach the server. Check your connection and try again.",
        fieldErrors: {},
      };
    }
    const body = err.response.data?.error;
    return {
      message: body?.message ?? "Something went wrong. Please try again.",
      code: body?.code,
      status: err.response.status,
      fieldErrors: body?.details ?? {},
    };
  }
  return { message: "Something went wrong. Please try again.", fieldErrors: {} };
}

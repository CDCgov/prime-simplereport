import { getAppInsightsHeaders } from "../TelemetryService";

interface JsonObject {
  [key: string]: any;
}

type RequestMethod = "GET" | "POST";

const JSON_CONTENT = "application/json";
const TEXT_CONTENT = "text/plain";
const baseHeaders = {
  "Content-Type": JSON_CONTENT,
  Accept: [JSON_CONTENT, TEXT_CONTENT].join(", "),
};
const instrumentationHeaders = getAppInsightsHeaders();
export const headers = { ...baseHeaders, ...instrumentationHeaders };

/**
 * Helper function to handle paths with or with out leading slash
 * example:
 * joinAbsoluteUrlPath("a/b", "/c/d/", "/e", "f/g", "h") -> "/a/b/c/d/e/f/g/h"
 */
function joinAbsoluteUrlPath(...args: string[]) {
  return args.map((pathPart) => pathPart.replace(/(^\/|\/$)/g, "")).join("/");
}

class FetchClient {
  basePath: string | undefined;
  defaultOptions: RequestInit | undefined;

  constructor(basePath?: string, defaultOptions?: RequestInit) {
    this.basePath = basePath;
    this.defaultOptions = defaultOptions;
  }

  getURL = (path: string) => {
    if (!import.meta.env.VITE_BACKEND_URL) {
      throw "VITE_BACKEND_URL variable has not been set.";
    }
    return new URL(
      this.basePath
        ? joinAbsoluteUrlPath(
            import.meta.env.VITE_BACKEND_URL,
            this.basePath,
            path
          )
        : joinAbsoluteUrlPath(import.meta.env.VITE_BACKEND_URL, path)
    ).href;
  };

  getOptions = (
    method: RequestMethod,
    body: JsonObject | null
  ): RequestInit => {
    return {
      ...this.defaultOptions,
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    };
  };

  request = async (
    path: string,
    body: JsonObject | null = null,
    method: RequestMethod = "POST",
    query = ""
  ) => {
    const res = await fetch(
      this.getURL(path + query),
      this.getOptions(method, body)
    );
    if (!res.ok) {
      const errorText = await res.text();
      if (String(errorText).includes("Session timeout")) {
        window.location.href = "/app/session-timeout";
        return;
      } else {
        throw errorText;
      }
    }
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.indexOf(JSON_CONTENT) !== -1) {
      try {
        return await res.json();
      } catch {
        throw new Error("Invalid JSON response");
      }
    } else {
      return "success";
    }
  };

  getRequest = async (path: string) => {
    const res = await fetch(this.getURL(path), {
      ...this.defaultOptions,
      method: "GET",
    });
    if (!res.ok) {
      throw res;
    }
    return res.text();
  };
}

export default FetchClient;

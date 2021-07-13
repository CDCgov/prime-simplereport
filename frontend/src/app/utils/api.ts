interface JsonObject {
  [key: string]: any;
}

type RequestMethod = "GET" | "POST";

const JSON_CONTENT = "application/json";
export const headers = {
  "Content-Type": JSON_CONTENT,
  Accept: JSON_CONTENT,
};

/**
 * Helper function to handle paths with or with out leading slash
 * example:
 * joinAbsoluteUrlPath("a/b", "/c/d/", "/e", "f/g", "h") -> "/a/b/c/d/e/f/g/h"
 */
function joinAbsoluteUrlPath(...args: string[]) {
  return args.map((pathPart) => pathPart.replace(/(^\/|\/$)/g, "")).join("/");
}
class FetchClient {
  basePath: string;
  defaultOptions: RequestInit | undefined;

  constructor(basePath: string, defaultOptions?: RequestInit) {
    this.basePath = basePath;
    this.defaultOptions = defaultOptions;
  }

  getURL = (path: string) => {
    if (!process.env.REACT_APP_BACKEND_URL) {
      throw Error("process.env.REACT_APP_BACKEND_URL is falsy");
    }
    return new URL(
      joinAbsoluteUrlPath(
        process.env.REACT_APP_BACKEND_URL,
        this.basePath,
        path
      )
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
      throw await res.text();
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

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
  return (
    "/" + args.map((pathPart) => pathPart.replace(/(^\/|\/$)/g, "")).join("/")
  );
}
class FetchClient {
  basePath: string;

  constructor(basePath: string) {
    this.basePath = "/api" + basePath;
  }

  getURL = (path: string, query: string) => {
    if (!process.env.REACT_APP_BACKEND_URL) {
      throw Error("process.env.REACT_APP_BACKEND_URL is falsy");
    }
    return new URL(
      joinAbsoluteUrlPath(this.basePath, path) + query,
      process.env.REACT_APP_BACKEND_URL
    ).href;
  };

  getOptions = (
    method: RequestMethod,
    body: JsonObject | null
  ): RequestInit => {
    return {
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
      this.getURL(path, query),
      this.getOptions(method, body)
    );
    if (!res.ok) {
      throw await res.json();
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
}

export default FetchClient;

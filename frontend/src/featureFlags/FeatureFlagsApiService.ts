import FetchClient from "../app/utils/api";

const api = new FetchClient(undefined, { mode: "cors" });

export class FeatureFlagsApiService {
  static featureFlags(params: Record<string, string> = {}) {
    const searchParams = new URLSearchParams(params);
    const query = "?" + searchParams.toString();
    return api.request("/feature-flags", null, "GET", query);
  }
}

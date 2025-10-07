import FetchClient from "../app/utils/api";

const api = new FetchClient(undefined, { mode: "cors" });

export class FeatureFlagsApiService {
  static featureFlags() {
    return api.request("/feature-flags", null, "GET", "");
  }
}

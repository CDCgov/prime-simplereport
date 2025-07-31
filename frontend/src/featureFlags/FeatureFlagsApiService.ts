import FetchClient from "../app/utils/api";

const api = new FetchClient(undefined, { mode: "cors" });

export type FeatureFlags = Record<string, boolean>;

export class FeatureFlagsApiService {
  static featureFlags(
    params: Record<string, string> = {}
  ): Promise<FeatureFlags> {
    const searchParams = new URLSearchParams(params).toString();
    const query = searchParams ? "?" + searchParams : "";
    return api.request("/feature-flags", null, "GET", query);
  }
}

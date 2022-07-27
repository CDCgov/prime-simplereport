import { render, screen } from "@testing-library/react";
import { useFeatures } from "flagged";

import { FeatureFlagsApiService } from "./FeatureFlagsApiService";
import WithFeatureFlags from "./WithFeatureFlags";

describe("WithFeatureFlags Component", () => {
  const InnerComponent = (): JSX.Element => {
    const flags = useFeatures();
    return <p data-testid="inner-component">{JSON.stringify(flags)}</p>;
  };

  beforeEach(() => {
    jest
      .spyOn(FeatureFlagsApiService, "featureFlags")
      .mockResolvedValue({ flag1: true });
  });

  it("checks that renders children and inner component receives the flag", async () => {
    render(
      <WithFeatureFlags>
        <InnerComponent />
      </WithFeatureFlags>
    );
    expect(screen.getByTestId("inner-component")).toBeInTheDocument();
    await screen.findByText(/flag1/i);
  });

  it("checks that flags are retrieved from the endpoint through FeatureFlagsApiService", async () => {
    render(
      <WithFeatureFlags>
        <InnerComponent />
      </WithFeatureFlags>
    );
    await screen.findByText(/flag1/i);
    expect(FeatureFlagsApiService.featureFlags).toHaveBeenCalled();
  });
});

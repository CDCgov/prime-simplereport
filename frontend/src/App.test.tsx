import { render, screen, waitFor } from "@testing-library/react";

import { App } from "./App";

jest.mock("./featureFlags/WithFeatureFlags", () => {
  return ({ children }: any): JSX.Element => <>{children}</>;
});

describe("index.js", () => {
  it("renders without crashing", async () => {
    render(App);
    expect(await screen.findByText("Loading account information"));
    await waitFor(() =>
      expect(
        screen.queryByText(/Loading account information/i)
      ).not.toBeInTheDocument()
    );
  });
});

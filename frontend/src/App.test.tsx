import { render, screen } from "@testing-library/react";
import createMockStore from "redux-mock-store";

import { ReactApp } from "./App";

jest.mock("./featureFlags/WithFeatureFlags", () => {
  return ({ children }: any): JSX.Element => <>{children}</>;
});

jest.mock("./app/ReportingApp", () => {
  return (): JSX.Element => <>Reporting App space holder</>;
});
describe("App Component", () => {
  it("renders without crashing", async () => {
    const mockStore = createMockStore([]);
    render(<ReactApp />);
    await screen.findByText(/Reporting App space holder/i);
  });
});

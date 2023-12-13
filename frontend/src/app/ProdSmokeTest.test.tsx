import { render, screen, waitFor } from "@testing-library/react";
import { FetchMock } from "jest-fetch-mock";

import ProdSmokeTest from "./ProdSmokeTest";

describe("ProdSmokeTest", () => {
  beforeEach(() => {
    (fetch as FetchMock).resetMocks();
  });

  it("renders success when returned from the API endpoint", async () => {
    (fetch as FetchMock).mockResponseOnce(JSON.stringify({ status: "UP" }));

    render(<ProdSmokeTest />);
    await waitFor(() =>
      expect(screen.queryByText("Status loading...")).not.toBeInTheDocument()
    );
    expect(screen.getByText("Status returned success :)"));
  });

  it("renders failure when returned from the API endpoint", async () => {
    (fetch as FetchMock).mockResponseOnce(JSON.stringify({ status: "DOWN" }));

    render(<ProdSmokeTest />);
    await waitFor(() =>
      expect(screen.queryByText("Status loading...")).not.toBeInTheDocument()
    );
    expect(screen.getByText("Status returned failure :("));
  });
});

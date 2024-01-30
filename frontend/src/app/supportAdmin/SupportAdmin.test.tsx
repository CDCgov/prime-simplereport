import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import * as flaggedMock from "flagged";

import SupportAdmin from "./SupportAdmin";

describe("SupportAdmin", () => {
  const renderWithRouter = () =>
    render(
      <MemoryRouter>
        <SupportAdmin />
      </MemoryRouter>
    );

  it("loads menu categories", () => {
    const { container } = renderWithRouter();
    expect(container).toMatchSnapshot();
  });

  it("loads menu categories including beta when hivBulkUploadEnabled flag is on", async () => {
    const flagSpy = jest.spyOn(flaggedMock, "useFeature");
    flagSpy.mockImplementation((flagName) => {
      return flagName === "hivBulkUploadEnabled";
    });
    renderWithRouter();
    expect(
      await screen.findByText("Beta - HIV CSV Upload", { exact: false })
    ).toBeInTheDocument();

    expect(flagSpy).toHaveBeenCalledWith("hivBulkUploadEnabled");
  });

  it("loads menu categories without beta when hivBulkUploadEnabled flag is off", async () => {
    const flagSpy = jest.spyOn(flaggedMock, "useFeature");
    flagSpy.mockImplementation((flagName) => {
      return flagName !== "hivBulkUploadEnabled";
    });
    renderWithRouter();
    expect(
      screen.queryByText("Beta - HIV CSV Upload", { exact: false })
    ).not.toBeInTheDocument();

    expect(flagSpy).toHaveBeenCalledWith("hivBulkUploadEnabled");
  });
});

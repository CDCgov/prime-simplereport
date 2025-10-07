import { render } from "@testing-library/react";
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

  it("loads menu categories including Beta", () => {
    jest.spyOn(flaggedMock, "useFeature").mockReturnValueOnce(true);
    const { container } = renderWithRouter();
    expect(container).toMatchSnapshot();
  });
});

import { render, screen } from "@testing-library/react";

import { showError, showSuccess } from "../utils/srToast";

import SRToastContainer from "./SRToastContainer";

const renderSRToastContainer = () => {
  return render(<SRToastContainer />);
};

const mockedUuids = [
  "299f6497-fba4-4bdc-9108-000000000000",
  "4ed92920-e42f-4b08-985f-111111111111",
  "0d33f293-ed86-4fc4-ad87-222222222222",
];
let mockUuidIndex = 0;

Object.defineProperty(globalThis, "crypto", {
  value: {
    randomUUID: () => mockedUuids[mockUuidIndex++ % mockedUuids.length],
  },
});

describe("SRToastContainer", () => {
  beforeEach(() => {
    mockUuidIndex = 0;
  });
  it("contains the error defaults", async () => {
    const view = renderSRToastContainer();
    await showError();
    expect(
      await screen.findByText("Problems saving data to server")
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Please check for missing data or typos.")
    ).toBeInTheDocument();
    expect(view).toMatchSnapshot();
  });

  it("contains the success defaults", async () => {
    const view = renderSRToastContainer();
    await showSuccess("A new patient has been added.", "Success");
    expect(
      await screen.findByText("A new patient has been added.")
    ).toBeInTheDocument();
    expect(await screen.findByText("Success")).toBeInTheDocument();
    expect(view).toMatchSnapshot();
  });
});

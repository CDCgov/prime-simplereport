import { render, screen } from "@testing-library/react";
import MockDate from "mockdate";

import { showError, showSuccess } from "../utils/srToast";

import SRToastContainer from "./SRToastContainer";

const renderSRToastContainer = () => {
  return render(<SRToastContainer />);
};

describe("SRToastContainer", () => {
  beforeAll(() => {
    MockDate.set(1667580636341);
  });

  afterAll(() => {
    MockDate.reset();
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

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import DeviceLookup from "./DeviceLookup";

describe("Device lookup - no devices", () => {
  beforeEach(() => {
    render(<DeviceLookup formTitle={"title"} deviceOptions={[]} />);
  });

  it("displays no results message", () => {
    userEvent.click(screen.getByTestId("combo-box-select"));
    expect(screen.getByText("No results found")).toBeInTheDocument();
  });
});

describe("Device lookup", () => {
  beforeEach(() => {
    render(
      <DeviceLookup
        formTitle={"title"}
        deviceOptions={[
          {
            internalId: "abc1",
            name: "Acme Emitter",
            model: "Model A",
            manufacturer: "Celoxitin",
            loincCode: "1234-1",
            swabTypes: [{ internalId: "123", name: "nose", typeCode: "n123" }],
            supportedDiseases: [
              { internalId: "123", name: "COVID-19", loinc: "1234-1" },
            ],
          },
          {
            internalId: "some-guid",
            name: "covid-mctester",
            model: "Giselle",
            manufacturer: "yo-mama",
            loincCode: "8675309",
            swabTypes: [
              { internalId: "123", name: "nose", typeCode: "nose-code" },
            ],
            supportedDiseases: [],
          },
        ]}
      />
    );
  });

  it("form is initially empty", () => {
    expect(screen.getByLabelText("Equipment model name")).toBeDisabled();
    expect(screen.getByLabelText("Test performed code")).toBeDisabled();
    expect(screen.getByTestId("combo-box-input")).toBeEnabled();
  });

  it("dropdown displays devices", () => {
    userEvent.click(screen.getByTestId("combo-box-select"));
    expect(screen.getAllByText("Acme Emitter")[1]).toBeInTheDocument();
    expect(screen.getAllByText("covid-mctester")[1]).toBeInTheDocument();
  });

  it("selected device displays device info", () => {
    userEvent.click(screen.getByTestId("combo-box-select"));
    userEvent.click(screen.getAllByText("Acme Emitter")[1]);

    const model = screen.getByLabelText("Equipment model name");
    expect(model).toBeDisabled();
    expect(model).toHaveValue("Model A");

    const loinc = screen.getByLabelText("Test performed code");
    expect(loinc).toBeDisabled();
    expect(loinc).toHaveValue("1234-1");
  });

  it("copy button displays when device selected", () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: () => {},
      },
    });

    jest.spyOn(navigator.clipboard, "writeText");

    //todo console error complaining about wrapping things in `act`
    userEvent.click(screen.getByTestId("combo-box-select"));
    userEvent.click(screen.getAllByText("Acme Emitter")[1]);

    const button = screen.getByLabelText(
      "Copy equipment model name for Acme Emitter"
    );
    userEvent.click(button);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("Model A");
  });
});

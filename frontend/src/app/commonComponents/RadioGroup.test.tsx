import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import RadioGroup from "./RadioGroup";

describe("RadioGroup", () => {
  let onChange: jest.Mock;
  let buttons = [
    { label: "Option 1", value: "1" },
    { label: "Option 2", value: "2" },
    { label: "Option 3", value: "3" },
  ];
  beforeEach(() => {
    onChange = jest.fn();
  });

  it("selects the correct value from the props", async () => {
    render(<RadioGroup onChange={onChange} buttons={buttons} />);
    await userEvent.click(screen.getByLabelText("Option 1"));
    expect(onChange).toBeCalledWith("1");
  });

  describe("is required", () => {
    it("renders an asterisk", async () => {
      render(
        <RadioGroup
          onChange={onChange}
          buttons={buttons}
          legend="Field Name"
          required={true}
        />
      );
      expect(await screen.findByText("*")).toBeInTheDocument();
    });
  });
});

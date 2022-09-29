import { render, screen } from "@testing-library/react";

import Dropdown from "./Dropdown";

describe("dropdown", () => {
  it("should include id on error message", () => {
    render(
      <Dropdown
        options={[{ label: "MockValue", value: "MockValue" }]}
        onChange={() => {}}
        selectedValue={""}
        errorMessage={"MyErrorMessage"}
        validationStatus={"error"}
      />
    );
    expect(screen.getByText("MockValue").parentElement).toHaveAttribute(
      "aria-describedby"
    );
    const expected = screen
      .getByText("MockValue")
      .parentElement?.getAttribute("aria-describedby");
    expect(screen.getByText("MyErrorMessage")).toHaveAttribute("id", expected);
  });
});

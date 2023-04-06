import { render } from "@testing-library/react";

import { focusOnFirstInputWithError } from "./formValidation";

describe("Form Validation: focusOnFirstInputWithError", () => {
  const dummyForm = (
    <form>
      <input type={"text"} data-testid={"inputOne"} />
      <input
        type={"text"}
        aria-invalid={true}
        aria-hidden={true}
        data-testid={"inputTwo"}
      />
      <input
        type={"text"}
        aria-invalid={true}
        aria-hidden={false}
        data-testid={"inputThree"}
      />
    </form>
  );

  it("focus on input with errors", () => {
    render(dummyForm);
    focusOnFirstInputWithError();
    expect(document?.activeElement?.getAttribute("data-testid")).toEqual(
      "inputTwo"
    );
  });

  it("focus on input with errors and ignores elements with aria-hidden", () => {
    render(dummyForm);
    focusOnFirstInputWithError(true);
    expect(document?.activeElement?.getAttribute("data-testid")).toEqual(
      "inputThree"
    );
  });

  it("does not throw exception when no element with error is found", () => {
    render(
      <form>
        <input type={"text"} data-testid={"inputOne"} />
      </form>
    );
    focusOnFirstInputWithError();
    expect(document?.activeElement?.getAttribute("data-testid")).toBeNull();
  });
});

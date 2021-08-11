import { useState } from "@storybook/addons";
import {
  fireEvent,
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";

import ManagePhoneNumbers from "./ManagePhoneNumbers";

const updateTestResultDelivery = jest.fn();
function ManagePhoneNumbersContainer() {
  const [phoneNumbers, updatePhoneNumbers] = useState<PhoneNumber[]>([]);

  return (
    <ManagePhoneNumbers
      phoneNumbers={phoneNumbers}
      testResultDelivery="NONE"
      updatePhoneNumbers={updatePhoneNumbers}
      updateTestResultDelivery={updateTestResultDelivery}
    />
  );
}

describe("ManagePhoneNumbers", () => {
  beforeEach(() => {
    render(<ManagePhoneNumbersContainer />);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("shows and clears errors", async () => {
    const primary = await screen.findByLabelText("Primary phone", {
      exact: false,
    });
    // Enter bad info and blur
    fireEvent.change(primary, { target: { value: "not a number" } });
    fireEvent.blur(primary);
    expect(
      await screen.findByText("Phone number is missing or invalid")
    ).toBeInTheDocument();
    screen.debug();
    // Enter good info and blur
    fireEvent.change(primary, { target: { value: "202-867-5309" } });
    fireEvent.blur(primary);
    await waitForElementToBeRemoved(() =>
      screen.queryByText("Phone number is missing or invalid")
    );
  });
});

import { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import ManagePhoneNumbers from "./ManagePhoneNumbers";

function ManagePhoneNumbersContainer() {
  const [phoneNumbers, updatePhoneNumbers] = useState<PhoneNumber[]>([]);

  return (
    <ManagePhoneNumbers
      phoneNumbers={phoneNumbers}
      testResultDelivery="NONE"
      updatePhoneNumbers={updatePhoneNumbers}
      updateTestResultDelivery={jest.fn()}
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
    // Enter good info and blur
    fireEvent.change(primary, { target: { value: "202-867-5309" } });
    fireEvent.blur(primary);
    await waitFor(() =>
      expect(
        screen.queryByText("Phone number is missing or invalid")
      ).not.toBeInTheDocument()
    );
  });
  it("adds and removes phone numbers", async () => {
    const primary = await screen.findByLabelText("Primary phone", {
      exact: false,
    });
    fireEvent.change(primary, { target: { value: "202-867-5309" } });
    const addButton = screen.getByText("Add another number", { exact: false });
    fireEvent.click(addButton);
    const second = await screen.findByLabelText("Additional phone", {
      exact: false,
    });
    fireEvent.change(second, { target: { value: "404-867-5309" } });
    fireEvent.click(
      await screen.findByLabelText("Delete phone number 404-867-5309")
    );
    await waitFor(() => {
      expect(second).not.toBeInTheDocument();
    });
  });
});

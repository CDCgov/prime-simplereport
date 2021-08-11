import { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import i18n from "../../../i18n";
import { es } from "../../../lang/es";

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
  afterEach(async () => {
    await waitFor(() => {
      i18n.changeLanguage("en");
    });
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
  it("handles multiple errors", async () => {
    const primary = await screen.findByLabelText("Primary phone", {
      exact: false,
    });
    // Show two errors
    fireEvent.change(primary, { target: { value: "" } });
    fireEvent.blur(primary);
    const addButton = screen.getByText("Add another number", { exact: false });
    fireEvent.click(addButton);
    const second = await screen.findByLabelText("Additional phone", {
      exact: false,
    });
    fireEvent.change(second, { target: { value: "" } });
    fireEvent.blur(second);
    await waitFor(() => {
      expect(
        screen.getAllByText("Phone number is missing or invalid").length
      ).toBe(2);
    });
    // Fix one of the errors
    fireEvent.change(primary, { target: { value: "3018675309" } });
    fireEvent.blur(primary);
    await waitFor(() => {
      expect(
        screen.getAllByText("Phone number is missing or invalid").length
      ).toBe(1);
    });
  });
  it("translates errors", async () => {
    const primary = await screen.findByLabelText("Primary phone", {
      exact: false,
    });
    // Show two errors
    fireEvent.change(primary, { target: { value: "" } });
    fireEvent.blur(primary);
    await waitFor(() => {
      i18n.changeLanguage("es");
    });
    expect(
      await screen.findByText(es.translation.patient.form.errors.telephone)
    ).toBeInTheDocument();
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

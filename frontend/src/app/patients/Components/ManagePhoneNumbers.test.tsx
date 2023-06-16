import { useRef, useState } from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

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
      phoneNumberValidator={useRef(null)}
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
    await act(async () => await userEvent.type(primary, "not a number"));
    await act(async () => await userEvent.tab());
    expect(
      await screen.findByText("Phone number is missing or invalid")
    ).toBeInTheDocument();
    // Enter good info and blur
    await act(async () => await userEvent.type(primary, "202-867-5309"));
    await act(async () => await userEvent.tab());
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
    await act(async () => await userEvent.clear(primary));
    await act(async () => await userEvent.tab());
    const addButton = screen.getByText("Add another number", { exact: false });
    await act(async () => await userEvent.click(addButton));
    const second = await screen.findByLabelText(/^Additional phone number/);
    await act(async () => await userEvent.clear(second));
    await act(async () => await userEvent.tab());
    await waitFor(() => {
      expect(
        screen.getAllByText("Phone number is missing or invalid").length
      ).toBe(2);
    });
    // Fix one of the errors
    await act(async () => await userEvent.type(primary, "3018675309"));
    await act(async () => await userEvent.tab());
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
    await act(async () => await userEvent.clear(primary));
    await act(async () => await userEvent.tab());

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
    await act(async () => await userEvent.type(primary, "202-867-5309"));
    const addButton = screen.getByText("Add another number", { exact: false });
    await act(async () => await userEvent.click(addButton));
    const second = await screen.findByLabelText(/^Additional phone number/);
    await act(async () => await userEvent.type(second, "404-867-5309"));
    await act(
      async () =>
        await userEvent.click(
          await screen.findByLabelText(
            "Delete additional phone number 404-867-5309"
          )
        )
    );
    await waitFor(() => {
      expect(second).not.toBeInTheDocument();
    });
  });
});

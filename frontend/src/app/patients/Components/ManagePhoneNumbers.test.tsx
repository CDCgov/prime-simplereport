import { useRef, useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "../../../i18n";
import { es } from "../../../lang/es";
import { eo } from "../../../lang/eo";

const langs = { es, eo };

import ManagePhoneNumbers from "./ManagePhoneNumbers";

function ManagePhoneNumbersContainer() {
  const [phoneNumbers, updatePhoneNumbers] = useState<PhoneNumber[]>([]);
  const [unknownPhoneNumber, setUnknownPhoneNumber] = useState(false);

  return (
    <ManagePhoneNumbers
      phoneNumbers={phoneNumbers}
      testResultDelivery="NONE"
      updatePhoneNumbers={updatePhoneNumbers}
      updateTestResultDelivery={jest.fn()}
      phoneNumberValidator={useRef(null)}
      unknownPhoneNumber={unknownPhoneNumber}
      setUnknownPhoneNumber={setUnknownPhoneNumber}
    />
  );
}

const renderWithUser = () => ({
  user: userEvent.setup(),
  ...render(<ManagePhoneNumbersContainer />),
});

describe("ManagePhoneNumbers", () => {
  afterEach(async () => {
    await waitFor(() => {
      i18n.changeLanguage("en");
    });
    jest.restoreAllMocks();
  });

  it("shows and clears errors", async () => {
    const { user } = renderWithUser();
    const primary = await screen.findByLabelText("Primary phone", {
      exact: false,
    });
    // Enter bad info and blur
    await user.type(primary, "not a number");
    await user.tab();
    expect(
      await screen.findByText("Phone number is missing or invalid")
    ).toBeInTheDocument();
    // Enter good info and blur
    await user.type(primary, "202-867-5309");
    await user.tab();
    await waitFor(() =>
      expect(
        screen.queryByText("Phone number is missing or invalid")
      ).not.toBeInTheDocument()
    );
  });
  it("handles multiple errors", async () => {
    const { user } = renderWithUser();
    const primary = await screen.findByLabelText("Primary phone", {
      exact: false,
    });
    // Show two errors
    await user.clear(primary);
    await user.tab();
    const addButton = screen.getByText("Add another number", { exact: false });
    await user.click(addButton);
    const second = await screen.findByLabelText(/^Additional phone number/);
    await user.clear(second);
    await user.tab();
    await waitFor(() => {
      expect(
        screen.getAllByText("Phone number is missing or invalid").length
      ).toBe(2);
    });
    // Fix one of the errors
    await user.type(primary, "3018675309");
    await user.tab();
    await waitFor(() => {
      expect(
        screen.getAllByText("Phone number is missing or invalid").length
      ).toBe(1);
    });
  });
  for (const [lang, translations] of Object.entries(langs)) {
    it("translates errors", async () => {
      const { user } = renderWithUser();
      const primary = await screen.findByLabelText("Primary phone", {
        exact: false,
      });
      // Show two errors
      await user.clear(primary);
      await user.tab();

      await waitFor(() => {
        i18n.changeLanguage(lang);
      });
      expect(
        await screen.findByText(translations.translation.patient.form.errors.telephone)
      ).toBeInTheDocument();
    });
  }
  it("adds and removes phone numbers", async () => {
    const { user } = renderWithUser();
    const primary = await screen.findByLabelText("Primary phone", {
      exact: false,
    });
    await user.type(primary, "202-867-5309");
    const addButton = screen.getByText("Add another number", { exact: false });
    await user.click(addButton);
    const second = await screen.findByLabelText(/^Additional phone number/);
    await user.type(second, "404-867-5309");

    await user.click(
      await screen.findByLabelText(
        "Delete additional phone number 404-867-5309"
      )
    );
    await waitFor(() => {
      expect(second).not.toBeInTheDocument();
    });
  });
  it("unknown number checkbox hides and displays phone number inputs", async () => {
    const { user } = renderWithUser();
    const phoneNumberInput = await screen.findByLabelText(
      "Primary phone number",
      { exact: false }
    );
    const phoneType = await screen.findByTestId("phoneType-0");
    expect(phoneNumberInput).toBeInTheDocument();
    expect(phoneType).toBeInTheDocument();

    const checkbox = await screen.findByLabelText("Phone number unknown", {
      exact: false,
    });
    await user.click(checkbox);
    expect(phoneNumberInput).not.toBeInTheDocument();
    expect(phoneType).not.toBeInTheDocument();

    await user.click(checkbox);
    expect(await screen.findByTestId("phoneType-0")).toBeInTheDocument();
    expect(
      await screen.findByLabelText("Primary phone number", { exact: false })
    ).toBeInTheDocument();
  });
});

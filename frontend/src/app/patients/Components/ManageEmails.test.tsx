import { useRef, useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "../../../i18n";
import { es } from "../../../lang/es";
import { eo } from "../../../lang/eo";

import ManageEmails from "./ManageEmails";

const langs = { es, eo };

const patient = {
  facilityId: "facility-id",
  lookupId: "lookup-id",
  firstName: "Eugenia",
  middleName: null,
  lastName: "Franecki",
  birthDate: "1939-10-11",
  street: "736 Jackson PI NW",
  streetTwo: "DC",
  city: null,
  state: "DC",
  zipCode: null,
  telephone: "(634) 397-4114",
  phoneNumbers: [
    {
      type: "MOBILE",
      number: "(634) 397-4114",
    },
  ],
  role: null,
  email: "foo@bar.com",
  emails: ["foo@bar.com"],
  county: null,
  country: null,
  race: null,
  ethnicity: null,
  gender: null,
  genderIdentity: null,
  residentCongregateSetting: null,
  employedInHealthcare: null,
  facility: null,
  testResultDelivery: null,
  preferredLanguage: null,
  tribalAffiliation: null,
  unknownPhoneNumber: false,
  unknownAddress: false,
  notes: null,
};

function ManageEmailsContainer() {
  const [emails, updateEmails] = useState<string[]>([]);

  return (
    <ManageEmails
      emails={emails}
      patient={patient}
      updateEmails={updateEmails}
      emailValidator={useRef(null)}
    />
  );
}

describe("ManageEmails", () => {
  const renderWithUser = () => ({
    user: userEvent.setup(),
    ...render(<ManageEmailsContainer />),
  });
  afterEach(async () => {
    await waitFor(() => {
      i18n.changeLanguage("en");
    });

    jest.clearAllMocks();
  });

  it("shows and clears errors", async () => {
    const { user } = renderWithUser();
    const primary = await screen.findByLabelText("Email address", {
      exact: false,
    });

    // Enter bad info and blur

    await user.type(primary, "invalid email");

    await user.tab();

    expect(
      await screen.findByText("Email is incorrectly formatted")
    ).toBeInTheDocument();

    // Enter good info and blur

    await user.clear(primary);

    await user.type(primary, "test@fake.com");

    await user.tab();

    await waitFor(() =>
      expect(
        screen.queryByText("Email is incorrectly formatted")
      ).not.toBeInTheDocument()
    );
  });

  for (const [lang, translations] of Object.entries(langs)) {
    it("translates errors", async () => {
      const { user } = renderWithUser();
      const primary = await screen.findByLabelText("Email address", {
        exact: false,
      });

      // Enter bad info and blur

      await user.type(primary, "invalid email");

      await user.tab();

      await waitFor(() => {
        i18n.changeLanguage(lang);
      });

      expect(
        await screen.findByText(translations.translation.patient.form.errors.email)
      ).toBeInTheDocument();
    });
  }

  it("adds and removes email addresses", async () => {
    const { user } = renderWithUser();
    const primary = await screen.findByLabelText("Email address", {
      exact: false,
    });

    await user.type(primary, "test@fake.com");

    const addButton = screen.getByRole("button", {
      name: /add another email address/i,
    });

    // adds more emails
    await user.click(addButton);

    await waitFor(() =>
      expect(
        screen.queryAllByLabelText("Additional email address").length
      ).toBe(1)
    );

    await user.click(addButton);

    await waitFor(() =>
      expect(
        screen.queryAllByLabelText("Additional email address").length
      ).toBe(2)
    );

    //fills in the input
    const seconds = await screen.findAllByLabelText("Additional email address");

    await user.type(seconds[1], "foo@bar.com");

    // removes additional email input fields

    await user.click(screen.getByTestId(`delete-email-1`));

    await waitFor(() =>
      expect(
        screen.queryAllByLabelText("Additional email address").length
      ).toBe(1)
    );

    await user.click(screen.getByTestId(`delete-email-1`));

    expect(
      screen.queryByText("Additional email address")
    ).not.toBeInTheDocument();
    expect(screen.queryByText("foo@bar.com")).not.toBeInTheDocument();
  });
});

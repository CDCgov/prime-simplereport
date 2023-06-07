/* eslint testing-library/no-unnecessary-act:0 */
import { useRef, useState } from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "../../../i18n";
import { es } from "../../../lang/es";

import ManageEmails from "./ManageEmails";

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
  residentCongregateSetting: null,
  employedInHealthcare: null,
  facility: null,
  testResultDelivery: null,
  preferredLanguage: null,
  tribalAffiliation: null,
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
  beforeEach(() => {
    render(<ManageEmailsContainer />);
  });

  afterEach(async () => {
    await waitFor(() => {
      i18n.changeLanguage("en");
    });

    jest.clearAllMocks();
  });

  it("shows and clears errors", async () => {
    const primary = await screen.findByLabelText("Email address", {
      exact: false,
    });

    // Enter bad info and blur
    await act(async () => {
      await userEvent.type(primary, "invalid email");
    });

    await act(async () => {
      await userEvent.tab();
    });
    expect(
      await screen.findByText("Email is incorrectly formatted")
    ).toBeInTheDocument();

    // Enter good info and blur
    await act(async () => {
      await userEvent.clear(primary);
    });

    await act(async () => {
      await userEvent.type(primary, "test@fake.com");
    });

    await act(async () => {
      await userEvent.tab();
    });

    await waitFor(() =>
      expect(
        screen.queryByText("Email is incorrectly formatted")
      ).not.toBeInTheDocument()
    );
  });

  it("translates errors", async () => {
    const primary = await screen.findByLabelText("Email address", {
      exact: false,
    });

    // Enter bad info and blur
    await act(async () => {
      await userEvent.type(primary, "invalid email");
    });

    await act(async () => {
      await userEvent.tab();
    });

    await waitFor(() => {
      i18n.changeLanguage("es");
    });

    expect(
      await screen.findByText(es.translation.patient.form.errors.email)
    ).toBeInTheDocument();
  });

  it("adds and removes email addresses", async () => {
    const primary = await screen.findByLabelText("Email address", {
      exact: false,
    });

    await act(async () => {
      await userEvent.type(primary, "test@fake.com");
    });

    const addButton = screen.getByRole("button", {
      name: /add another email address/i,
    });

    // adds more emails
    await act(async () => {
      await userEvent.click(addButton);
    });

    await waitFor(() =>
      expect(
        screen.queryAllByLabelText("Additional email address").length
      ).toBe(1)
    );

    await act(async () => {
      await userEvent.click(addButton);
    });

    await waitFor(() =>
      expect(
        screen.queryAllByLabelText("Additional email address").length
      ).toBe(2)
    );

    //fills in the input
    const seconds = await screen.findAllByLabelText("Additional email address");
    await act(async () => {
      await userEvent.type(seconds[1], "foo@bar.com");
    });

    // removes additional email input fields
    await act(async () => {
      await userEvent.click(screen.getByTestId(`delete-email-1`));
    });

    await waitFor(() =>
      expect(
        screen.queryAllByLabelText("Additional email address").length
      ).toBe(1)
    );

    await act(async () => {
      await userEvent.click(screen.getByTestId(`delete-email-1`));
    });

    expect(
      screen.queryByText("Additional email address")
    ).not.toBeInTheDocument();
    expect(screen.queryByText("foo@bar.com")).not.toBeInTheDocument();
  });
});

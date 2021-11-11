import { useRef, useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
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
    const primary = await screen.findByLabelText("Primary email address", {
      exact: false,
    });

    // Enter bad info and blur
    userEvent.type(primary, "invalid email");
    userEvent.tab();
    expect(
      await screen.findByText("Email is missing or incorrectly formatted")
    ).toBeInTheDocument();

    // Enter good info and blur
    userEvent.clear(primary);
    userEvent.type(primary, "test@fake.com");
    userEvent.tab();

    await waitFor(() =>
      expect(
        screen.queryByText("Email is missing or incorrectly formatted")
      ).not.toBeInTheDocument()
    );
  });

  it("translates errors", async () => {
    const primary = await screen.findByLabelText("Primary email address", {
      exact: false,
    });

    // Enter bad info and blur
    userEvent.type(primary, "invalid email");
    userEvent.tab();

    await waitFor(() => {
      i18n.changeLanguage("es");
    });

    expect(
      await screen.findByText(es.translation.patient.form.errors.email)
    ).toBeInTheDocument();
  });

  it("adds and removes email addresses", async () => {
    const primary = await screen.findByLabelText("Primary email address", {
      exact: false,
    });

    userEvent.type(primary, "test@fake.com");
    const addButton = screen.getByText("Add another email address", {
      exact: false,
    });
    await waitFor(() => {
      userEvent.click(addButton);
    });
    const second = await screen.findByText("Additional email address", {
      exact: false,
    });
    userEvent.type(second, "foo@bar.com");
    userEvent.click(
      await screen.findByLabelText("Delete email", { exact: false })
    );
    await waitFor(() => {
      expect(second).not.toBeInTheDocument();
    });
  });
});

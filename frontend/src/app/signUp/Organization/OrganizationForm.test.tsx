import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import OrganizationForm, {
  OrganizationCreateRequest,
} from "./OrganizationForm";

const getOrgNameInput = () =>
  screen.getByRole("textbox", {
    name: "Organization name required",
  });
const getOrgStateDropdown = () =>
  screen.getByLabelText("Organization state *") as HTMLSelectElement;
const getOrgTypeDropdown = () => screen.getByLabelText("Organization type *");
const getFirstNameInput = () => screen.getByLabelText("First name *");
const getMiddleNameInput = () => screen.getByLabelText("Middle name");
const getLastNameInput = () => screen.getByLabelText("Last name *");
const getEmailInput = () => screen.getByLabelText("Work email *");
const getPhoneInput = () => screen.getByLabelText("Work phone number *");
const getSubmitButton = () => screen.getByText("Continue");

const fillInDropDown = async (input: any, text: string) =>
  await act(async () => await userEvent.selectOptions(input, [text]));

jest.mock("../SignUpApi", () => ({
  SignUpApi: {
    createOrganization: (request: OrganizationCreateRequest) => {
      if (request.name === "Drake") {
        return Promise.resolve({ orgExternalId: "foo" });
      } else if (request.name === "Duplicate") {
        throw new Error(
          "This organization has already registered with SimpleReport."
        );
      } else if (request.email === "duplicate@test.com") {
        throw new Error(
          "This email address is already associated with a SimpleReport user."
        );
      } else if (request.name === "DuplicateAdmin") {
        throw new Error(
          "Duplicate organization with admin user that has not completed identity verification."
        );
      } else if (request.name === "IdentityVerificationComplete") {
        throw new Error(
          "Duplicate organization with admin user who has completed identity verification."
        );
      } else if (request.name === "InternalError") {
        throw new Error(
          "An unknown error occurred when creating this organization in Okta."
        );
      } else {
        throw new Error("This is an error.");
      }
    },
  },
}));

jest.mock("react-router-dom", () => ({
  Navigate: (props: any) => `Redirected to ${props.to}`,
}));

window.scrollTo = jest.fn();

describe("OrganizationForm", () => {
  beforeEach(() => {
    render(<OrganizationForm />);
  });

  it("initializes with the submit button disabled", () => {
    expect(getOrgNameInput()).toBeTruthy();
    expect(getOrgStateDropdown()).toBeTruthy();
    expect(getOrgTypeDropdown()).toBeTruthy();
    expect(getFirstNameInput()).toBeTruthy();
    expect(getMiddleNameInput()).toBeTruthy();
    expect(getLastNameInput()).toBeTruthy();
    expect(getEmailInput()).toBeTruthy();
    expect(getPhoneInput()).toBeTruthy();
    expect(getSubmitButton()).toHaveAttribute("disabled");
  });

  it("displays form errors when submitting invalid input", async () => {
    await fillInDropDown(getOrgStateDropdown(), "VI");
    await act(async () => await userEvent.tab());
    await act(async () => getSubmitButton().click());

    expect(await screen.findByText("Organization name is required"));

    expect(
      screen.getByText("Organization type is required")
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "U.S. Virgin Islands isn't connected to SimpleReport yet.",
        {
          exact: false,
        }
      )
    ).toBeInTheDocument();
  });

  it("clears input when escaping out of modal", async () => {
    await fillInDropDown(getOrgStateDropdown(), "VI");
    expect(getOrgStateDropdown().value).toEqual("VI");
    await act(async () => await userEvent.tab());
    expect(
      screen.getByText(
        "U.S. Virgin Islands isn't connected to SimpleReport yet.",
        {
          exact: false,
        }
      )
    ).toBeInTheDocument();

    await act(async () => await userEvent.keyboard("{Escape}"));
    expect(getOrgStateDropdown().value).toBeFalsy();
  });

  it("does not clear input when continuing through modal", async () => {
    await fillInDropDown(getOrgStateDropdown(), "VI");
    expect(getOrgStateDropdown().value).toEqual("VI");
    await act(async () => await userEvent.tab());
    expect(
      screen.getByText(
        "U.S. Virgin Islands isn't connected to SimpleReport yet.",
        {
          exact: false,
        }
      )
    ).toBeInTheDocument();

    await act(async () => screen.getByLabelText("acknowledged").click());
    await act(async () => screen.getByText("Continue sign up").click());

    expect(getOrgStateDropdown().value).toEqual("VI");
  });

  it("redirects to identity verification when submitting valid input", async () => {
    await act(async () => await userEvent.type(getOrgNameInput(), "Drake"));
    await fillInDropDown(getOrgStateDropdown(), "TX");
    await fillInDropDown(getOrgTypeDropdown(), "Employer");
    await act(
      async () => await userEvent.type(getFirstNameInput(), "Greatest")
    );
    await act(async () => await userEvent.type(getMiddleNameInput(), "OG"));
    await act(async () => await userEvent.type(getLastNameInput(), "Ever"));
    await act(
      async () => await userEvent.type(getEmailInput(), "ever@greatest.com")
    );
    await act(async () => await userEvent.type(getPhoneInput(), "8008675309"));
    await act(async () => getSubmitButton().click());

    expect(
      await screen.findByText("Redirected to /sign-up/identity-verification")
    );
  });

  it("displays a duplicate org error when submitting a duplicate org", async () => {
    await act(async () => await userEvent.type(getOrgNameInput(), "Duplicate"));
    await fillInDropDown(getOrgStateDropdown(), "TX");
    await fillInDropDown(getOrgTypeDropdown(), "Employer");
    await act(
      async () => await userEvent.type(getFirstNameInput(), "Greatest")
    );
    await act(async () => await userEvent.type(getMiddleNameInput(), "OG"));
    await act(async () => await userEvent.type(getLastNameInput(), "Ever"));
    await act(
      async () => await userEvent.type(getEmailInput(), "ever@greatest.com")
    );
    await act(async () => await userEvent.type(getPhoneInput(), "8008675309"));
    await act(async () => getSubmitButton().click());

    expect(
      await screen.findByText(
        "This organization already has a SimpleReport account. Please contact your organization administrator to request access.",
        { exact: false }
      )
    );
  });

  it("displays a duplicate email error when submitting a duplicate email", async () => {
    await act(async () => await userEvent.type(getOrgNameInput(), "Foo"));
    await fillInDropDown(getOrgStateDropdown(), "TX");
    await fillInDropDown(getOrgTypeDropdown(), "Employer");
    await act(
      async () => await userEvent.type(getFirstNameInput(), "Greatest")
    );
    await act(async () => await userEvent.type(getMiddleNameInput(), "OG"));
    await act(async () => await userEvent.type(getLastNameInput(), "Ever"));
    await act(
      async () => await userEvent.type(getEmailInput(), "duplicate@test.com")
    );
    await act(async () => await userEvent.type(getPhoneInput(), "8008675309"));
    await act(async () => getSubmitButton().click());

    expect(
      await screen.findByText(
        "This email address is already registered with SimpleReport.",
        { exact: false }
      )
    );
  });

  it("displays a duplicate org error and id verification link for an admin re-signing up", async () => {
    await act(
      async () => await userEvent.type(getOrgNameInput(), "DuplicateAdmin")
    );
    await fillInDropDown(getOrgStateDropdown(), "TX");
    await fillInDropDown(getOrgTypeDropdown(), "Employer");
    await act(
      async () => await userEvent.type(getFirstNameInput(), "Greatest")
    );
    await act(async () => await userEvent.type(getMiddleNameInput(), "OG"));
    await act(async () => await userEvent.type(getLastNameInput(), "Ever"));
    await act(
      async () => await userEvent.type(getEmailInput(), "admin@example.com")
    );
    await act(async () => await userEvent.type(getPhoneInput(), "8008675309"));
    await act(async () => getSubmitButton().click());

    expect(
      await screen.findByText(
        "Your organization is already registered with SimpleReport. To begin using it, schedule a time",
        { exact: false }
      )
    );
  });

  it("displays a duplicate org error and instructions for admin user who has finished id verification", async () => {
    await act(
      async () =>
        await userEvent.type(getOrgNameInput(), "IdentityVerificationComplete")
    );
    await fillInDropDown(getOrgStateDropdown(), "TX");
    await fillInDropDown(getOrgTypeDropdown(), "Employer");
    await act(
      async () => await userEvent.type(getFirstNameInput(), "Greatest")
    );
    await act(async () => await userEvent.type(getMiddleNameInput(), "OG"));
    await act(async () => await userEvent.type(getLastNameInput(), "Ever"));
    await act(
      async () => await userEvent.type(getEmailInput(), "admin@example.com")
    );
    await act(async () => await userEvent.type(getPhoneInput(), "8008675309"));
    await act(async () => getSubmitButton().click());

    expect(
      await screen.findByText(
        "Your organization is already registered with SimpleReport. Check your email for instructions on setting up your account.",
        { exact: false }
      )
    );
  });

  it("displays a generic error message for Okta internal errors", async () => {
    await act(
      async () => await userEvent.type(getOrgNameInput(), "InternalError")
    );
    await fillInDropDown(getOrgStateDropdown(), "TX");
    await fillInDropDown(getOrgTypeDropdown(), "Employer");
    await act(
      async () => await userEvent.type(getFirstNameInput(), "Greatest")
    );
    await act(async () => await userEvent.type(getMiddleNameInput(), "OG"));
    await act(async () => await userEvent.type(getLastNameInput(), "Ever"));
    await act(
      async () => await userEvent.type(getEmailInput(), "admin@example.com")
    );
    await act(async () => await userEvent.type(getPhoneInput(), "8008675309"));
    await act(async () => getSubmitButton().click());

    expect(
      await screen.findByText(
        "An unexpected error occurred. Please resubmit this form",
        { exact: false }
      )
    );
  });
});

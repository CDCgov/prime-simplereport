import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import OrganizationForm, {
  OrganizationCreateRequest,
} from "./OrganizationForm";

const getOrgNameInput = () =>
  screen.getByRole("textbox", {
    name: "Organization name required",
  });
const getOrgStateDropdown = () => screen.getByLabelText("Organization state *");
const getOrgTypeDropdown = () => screen.getByLabelText("Organization type *");
const getFirstNameInput = () => screen.getByLabelText("First name *");
const getMiddleNameInput = () => screen.getByLabelText("Middle name");
const getLastNameInput = () => screen.getByLabelText("Last name *");
const getEmailInput = () => screen.getByLabelText("Work email *");
const getPhoneInput = () => screen.getByLabelText("Work phone number *");
const getSubmitButton = () => screen.getByText("Continue");

const fillInDropDown = (input: any, text: string) =>
  userEvent.selectOptions(input, [text]);

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

jest.mock("react-router", () => ({
  Navigate: (props: any) => `Redirected to ${props.to.pathname}`,
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
    fillInDropDown(getOrgStateDropdown(), "IN");
    getSubmitButton().click();

    expect(
      await screen.findByText("Organization name is required")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Organization type is required")
    ).toBeInTheDocument();

    expect(
      screen.getByText("SimpleReport isn't available yet in your state.", {
        exact: false,
      })
    ).toBeInTheDocument();
  });

  it("redirects to identity verification when submitting valid input", async () => {
    userEvent.type(getOrgNameInput(), "Drake");
    fillInDropDown(getOrgStateDropdown(), "TX");
    fillInDropDown(getOrgTypeDropdown(), "Employer");
    userEvent.type(getFirstNameInput(), "Greatest");
    userEvent.type(getMiddleNameInput(), "OG");
    userEvent.type(getLastNameInput(), "Ever");
    userEvent.type(getEmailInput(), "ever@greatest.com");
    userEvent.type(getPhoneInput(), "8008675309");
    getSubmitButton().click();

    expect(
      await screen.findByText("Redirected to /sign-up/identity-verification")
    ).toBeInTheDocument();
  });

  it("displays a duplicate org error when submitting a duplicate org", async () => {
    userEvent.type(getOrgNameInput(), "Duplicate");
    fillInDropDown(getOrgStateDropdown(), "TX");
    fillInDropDown(getOrgTypeDropdown(), "Employer");
    userEvent.type(getFirstNameInput(), "Greatest");
    userEvent.type(getMiddleNameInput(), "OG");
    userEvent.type(getLastNameInput(), "Ever");
    userEvent.type(getEmailInput(), "ever@greatest.com");
    userEvent.type(getPhoneInput(), "8008675309");
    getSubmitButton().click();

    expect(
      await screen.findByText(
        "This organization already has a SimpleReport account. Please contact your organization administrator to request access.",
        { exact: false }
      )
    ).toBeInTheDocument();
  });

  it("displays a duplicate email error when submitting a duplicate email", async () => {
    userEvent.type(getOrgNameInput(), "Foo");
    fillInDropDown(getOrgStateDropdown(), "TX");
    fillInDropDown(getOrgTypeDropdown(), "Employer");
    userEvent.type(getFirstNameInput(), "Greatest");
    userEvent.type(getMiddleNameInput(), "OG");
    userEvent.type(getLastNameInput(), "Ever");
    userEvent.type(getEmailInput(), "duplicate@test.com");
    userEvent.type(getPhoneInput(), "8008675309");
    getSubmitButton().click();

    expect(
      await screen.findByText(
        "This email address is already registered with SimpleReport.",
        { exact: false }
      )
    ).toBeInTheDocument();
  });

  it("displays a duplicate org error and id verification link for an admin re-signing up", async () => {
    userEvent.type(getOrgNameInput(), "DuplicateAdmin");
    fillInDropDown(getOrgStateDropdown(), "TX");
    fillInDropDown(getOrgTypeDropdown(), "Employer");
    userEvent.type(getFirstNameInput(), "Greatest");
    userEvent.type(getMiddleNameInput(), "OG");
    userEvent.type(getLastNameInput(), "Ever");
    userEvent.type(getEmailInput(), "admin@example.com");
    userEvent.type(getPhoneInput(), "8008675309");
    getSubmitButton().click();

    expect(
      await screen.findByText(
        "Your organization is already registered with SimpleReport. To begin using it, schedule a time",
        { exact: false }
      )
    ).toBeInTheDocument();
  });

  it("displays a duplicate org error and instructions for admin user who has finished id verification", async () => {
    userEvent.type(getOrgNameInput(), "IdentityVerificationComplete");
    fillInDropDown(getOrgStateDropdown(), "TX");
    fillInDropDown(getOrgTypeDropdown(), "Employer");
    userEvent.type(getFirstNameInput(), "Greatest");
    userEvent.type(getMiddleNameInput(), "OG");
    userEvent.type(getLastNameInput(), "Ever");
    userEvent.type(getEmailInput(), "admin@example.com");
    userEvent.type(getPhoneInput(), "8008675309");
    getSubmitButton().click();

    expect(
      await screen.findByText(
        "Your organization is already registered with SimpleReport. Check your email for instructions on setting up your account.",
        { exact: false }
      )
    ).toBeInTheDocument();
  });

  it("displays a generic error message for Okta internal errors", async () => {
    userEvent.type(getOrgNameInput(), "InternalError");
    fillInDropDown(getOrgStateDropdown(), "TX");
    fillInDropDown(getOrgTypeDropdown(), "Employer");
    userEvent.type(getFirstNameInput(), "Greatest");
    userEvent.type(getMiddleNameInput(), "OG");
    userEvent.type(getLastNameInput(), "Ever");
    userEvent.type(getEmailInput(), "admin@example.com");
    userEvent.type(getPhoneInput(), "8008675309");
    getSubmitButton().click();

    expect(
      await screen.findByText(
        "An unexpected error occurred. Please resubmit this form",
        { exact: false }
      )
    ).toBeInTheDocument();
  });
});

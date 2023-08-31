import { render, screen, waitFor } from "@testing-library/react";
import user from "@testing-library/user-event";
import { userEvent } from "@storybook/testing-library";

import OrganizationForm, {
  OrganizationCreateRequest,
} from "./OrganizationForm";

const getOrgNameInput = () =>
  screen.getByRole("textbox", {
    name: "Organization name *",
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
  await user.selectOptions(input, [text]);

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
  const user = userEvent.setup();
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
    await user.tab();
    await user.click(getSubmitButton());

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
    await user.tab();
    expect(
      screen.getByText(
        "U.S. Virgin Islands isn't connected to SimpleReport yet.",
        {
          exact: false,
        }
      )
    ).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(getOrgStateDropdown().value).toBeFalsy();
  });

  it("does not clear input when continuing through modal", async () => {
    await fillInDropDown(getOrgStateDropdown(), "VI");

    await waitFor(() => {
      expect(getOrgStateDropdown().value).toEqual("VI");
    });

    await user.tab();
    const messageString =
      "U.S. Virgin Islands isn't connected to SimpleReport yet.";

    await waitFor(() => {
      screen.getByText(messageString, {
        exact: false,
      });
    });

    const acknowledgedCheckbox = screen.getByLabelText("acknowledged");
    await user.click(acknowledgedCheckbox);

    await waitFor(async () => {
      expect(acknowledgedCheckbox).toBeChecked();
    });

    await waitFor(async () => {
      expect(screen.getByText("Continue sign up")).toBeEnabled();
    });

    await user.click(screen.getByText("Continue sign up"));

    expect(getOrgStateDropdown().value).toEqual("VI");
  });

  it.only("redirects to identity verification when submitting valid input", async () => {
    await user.type(getOrgNameInput(), "Drake");
    await fillInDropDown(getOrgStateDropdown(), "TX");
    await fillInDropDown(getOrgTypeDropdown(), "Employer");

    await user.type(getFirstNameInput(), "Greatest");

    await user.type(getMiddleNameInput(), "OG");
    await user.type(getLastNameInput(), "Ever");

    await user.type(getEmailInput(), "ever@greatest.com");

    await user.type(getPhoneInput(), "8008675309");
    await user.click(getSubmitButton());

    await waitFor(() => {
      expect(screen.getByText("Redirected to /sign-up/identity-verification"));
    });
  });

  it("displays a duplicate org error when submitting a duplicate org", async () => {
    await user.type(getOrgNameInput(), "Duplicate");
    await fillInDropDown(getOrgStateDropdown(), "TX");
    await fillInDropDown(getOrgTypeDropdown(), "Employer");

    await user.type(getFirstNameInput(), "Greatest");

    await user.type(getMiddleNameInput(), "OG");
    await user.type(getLastNameInput(), "Ever");

    await user.type(getEmailInput(), "ever@greatest.com");
    await user.type(getPhoneInput(), "8008675309");
    await user.click(getSubmitButton());

    expect(
      await screen.findByText(
        "This organization already has a SimpleReport account. Please contact your organization administrator to request access.",
        { exact: false }
      )
    );
  });

  it("displays a duplicate email error when submitting a duplicate email", async () => {
    await user.type(getOrgNameInput(), "Foo");
    await fillInDropDown(getOrgStateDropdown(), "TX");
    await fillInDropDown(getOrgTypeDropdown(), "Employer");

    await user.type(getFirstNameInput(), "Greatest");
    await user.type(getMiddleNameInput(), "OG");
    await user.type(getPhoneInput(), "8008675309");
    await user.type(getLastNameInput(), "Ever");
    await user.type(getEmailInput(), "duplicate@test.com");

    await user.click(getSubmitButton());

    expect(
      await screen.findByText(
        "This email address is already registered with SimpleReport.",
        { exact: false }
      )
    );
  });

  it("displays a duplicate org error and id verification link for an admin re-signing up", async () => {
    await user.type(getOrgNameInput(), "DuplicateAdmin");

    await fillInDropDown(getOrgStateDropdown(), "TX");
    await fillInDropDown(getOrgTypeDropdown(), "Employer");

    await user.type(getFirstNameInput(), "Greatest");

    await user.type(getMiddleNameInput(), "OG");
    await user.type(getLastNameInput(), "Ever");

    await user.type(getEmailInput(), "admin@example.com");

    await user.type(getPhoneInput(), "8008675309");
    await user.click(getSubmitButton());

    expect(
      await screen.findByText(
        "Your organization is already registered with SimpleReport. To begin using it, schedule a time",
        { exact: false }
      )
    );
  });

  it("displays a duplicate org error and instructions for admin user who has finished id verification", async () => {
    await user.type(getOrgNameInput(), "IdentityVerificationComplete");

    await fillInDropDown(getOrgStateDropdown(), "TX");
    await fillInDropDown(getOrgTypeDropdown(), "Employer");

    await user.type(getFirstNameInput(), "Greatest");

    await user.type(getMiddleNameInput(), "OG");
    await user.type(getLastNameInput(), "Ever");

    await user.type(getEmailInput(), "admin@example.com");
    await user.type(getPhoneInput(), "8008675309");
    await user.click(getSubmitButton());

    expect(
      await screen.findByText(
        "Your organization is already registered with SimpleReport. Check your email for instructions on setting up your account.",
        { exact: false }
      )
    );
  });

  it("displays a generic error message for Okta internal errors", async () => {
    await user.type(getOrgNameInput(), "InternalError");
    await fillInDropDown(getOrgStateDropdown(), "TX");
    await fillInDropDown(getOrgTypeDropdown(), "Employer");

    await user.type(getFirstNameInput(), "Greatest");
    await user.type(getMiddleNameInput(), "OG");
    await user.type(getLastNameInput(), "Ever");

    await user.type(getEmailInput(), "admin@example.com");

    await user.type(getPhoneInput(), "8008675309");

    getSubmitButton().click();

    expect(
      screen.queryByText(
        "An unexpected error occurred. Please resubmit this form",
        { exact: false }
      )
    );
  });
});

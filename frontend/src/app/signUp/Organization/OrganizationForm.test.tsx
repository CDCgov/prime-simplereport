import { render, screen } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { useFeature } from "flagged";

import OrganizationForm, {
  OrganizationCreateRequest,
} from "./OrganizationForm";

const getOrgNameInput = () =>
  screen.getByRole("textbox", { name: /organization name \*/i });
const getOrgStateDropdown = () =>
  screen.getByLabelText("Organization state *") as HTMLSelectElement;
const getOrgTypeDropdown = () => screen.getByLabelText("Organization type *");
const getFirstNameInput = () => screen.getByLabelText("First name *");
const getMiddleNameInput = () => screen.getByLabelText("Middle name");
const getLastNameInput = () => screen.getByLabelText("Last name *");
const getEmailInput = () => screen.getByLabelText("Work email *");
const getPhoneInput = () => screen.getByLabelText("Work phone number *");
const getSubmitButton = () => screen.getByText("Continue");

const fillInDropDown = async (user: UserEvent, input: any, text: string) =>
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

jest.mock("flagged", () => ({
  useFeature: jest.fn(),
}));

window.scrollTo = jest.fn();

const mockFlags = (flags: Record<string, boolean>) => {
  const mockedUseFeature = useFeature as jest.MockedFunction<typeof useFeature>;
  mockedUseFeature.mockImplementation((flagName) => {
    return Boolean(flags[flagName]);
  });
};

describe("OrganizationForm", () => {
  const renderWithUser = () => ({
    user: userEvent.setup(),
    ...render(<OrganizationForm />),
  });

  it("initializes with the submit button disabled", () => {
    renderWithUser();
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
    const { user } = renderWithUser();
    await fillInDropDown(user, getOrgStateDropdown(), "AS");
    await user.tab();
    await user.click(getSubmitButton());

    expect(await screen.findByText("Organization name is required"));

    expect(
      screen.getByText("Organization type is required")
    ).toBeInTheDocument();

    expect(
      screen.getByText("American Samoa isn't connected to SimpleReport yet.", {
        exact: false,
      })
    ).toBeInTheDocument();
  });

  it("clears input when escaping out of modal", async () => {
    const { user } = renderWithUser();
    await fillInDropDown(user, getOrgStateDropdown(), "AS");
    expect(getOrgStateDropdown().value).toEqual("AS");
    await user.tab();
    expect(
      screen.getByText("American Samoa isn't connected to SimpleReport yet.", {
        exact: false,
      })
    ).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(getOrgStateDropdown().value).toBeFalsy();
  });

  it("does not clear input when continuing through modal", async () => {
    const { user } = renderWithUser();
    await fillInDropDown(user, getOrgStateDropdown(), "AS");
    expect(getOrgStateDropdown().value).toEqual("AS");
    await user.tab();
    expect(
      screen.getByText("American Samoa isn't connected to SimpleReport yet.", {
        exact: false,
      })
    ).toBeInTheDocument();

    await user.click(screen.getByLabelText("acknowledged"));
    await user.click(screen.getByText("Continue sign up"));

    expect(getOrgStateDropdown().value).toEqual("AS");
  });

  it("redirects to identity verification when submitting valid input", async () => {
    mockFlags({ identityVerificationEnabled: true });
    const { user } = renderWithUser();
    await user.type(getOrgNameInput(), "Drake");
    await fillInDropDown(user, getOrgStateDropdown(), "TX");
    await fillInDropDown(user, getOrgTypeDropdown(), "Employer");
    await user.type(getFirstNameInput(), "Greatest");
    await user.type(getMiddleNameInput(), "OG");
    await user.type(getLastNameInput(), "Ever");
    await user.type(getEmailInput(), "ever@greatest.com");
    await user.type(getPhoneInput(), "8008675309");
    await user.click(getSubmitButton());

    expect(
      await screen.findByText("Redirected to /sign-up/identity-verification")
    );
  });

  it("displays a duplicate org error when submitting a duplicate org", async () => {
    const { user } = renderWithUser();
    await user.type(getOrgNameInput(), "Duplicate");
    await fillInDropDown(user, getOrgStateDropdown(), "TX");
    await fillInDropDown(user, getOrgTypeDropdown(), "Employer");
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
    const { user } = renderWithUser();
    await user.type(getOrgNameInput(), "Foo");
    await fillInDropDown(user, getOrgStateDropdown(), "TX");
    await fillInDropDown(user, getOrgTypeDropdown(), "Employer");
    await user.type(getFirstNameInput(), "Greatest");
    await user.type(getMiddleNameInput(), "OG");
    await user.type(getLastNameInput(), "Ever");
    await user.type(getEmailInput(), "duplicate@test.com");
    await user.type(getPhoneInput(), "8008675309");
    await user.click(getSubmitButton());

    expect(
      await screen.findByText(
        "This email address is already registered with SimpleReport.",
        { exact: false }
      )
    );
  });

  it("displays a duplicate org error and id verification link for an admin re-signing up", async () => {
    const { user } = renderWithUser();
    await user.type(getOrgNameInput(), "DuplicateAdmin");
    await fillInDropDown(user, getOrgStateDropdown(), "TX");
    await fillInDropDown(user, getOrgTypeDropdown(), "Employer");
    await user.type(getFirstNameInput(), "Greatest");
    await user.type(getMiddleNameInput(), "OG");
    await user.type(getLastNameInput(), "Ever");
    await user.type(getEmailInput(), "admin@example.com");
    await user.type(getPhoneInput(), "8008675309");
    await user.click(getSubmitButton());

    expect(
      await screen.findByText(
        "Your organization is already registered with SimpleReport. To begin using it, email",
        { exact: false }
      )
    );
  });

  it("displays a duplicate org error and instructions for admin user who has finished id verification", async () => {
    const { user } = renderWithUser();

    await user.type(getOrgNameInput(), "IdentityVerificationComplete");
    await fillInDropDown(user, getOrgStateDropdown(), "TX");
    await fillInDropDown(user, getOrgTypeDropdown(), "Employer");
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
    const { user } = renderWithUser();
    await user.type(getOrgNameInput(), "InternalError");
    await fillInDropDown(user, getOrgStateDropdown(), "TX");
    await fillInDropDown(user, getOrgTypeDropdown(), "Employer");
    await user.type(getFirstNameInput(), "Greatest");
    await user.type(getMiddleNameInput(), "OG");
    await user.type(getLastNameInput(), "Ever");
    await user.type(getEmailInput(), "admin@example.com");
    await user.type(getPhoneInput(), "8008675309");
    await user.click(getSubmitButton());

    expect(
      await screen.findByText(
        "An unexpected error occurred. Please resubmit this form",
        { exact: false }
      )
    );
  });
});

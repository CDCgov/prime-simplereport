import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import OrganizationForm, {
  OrganizationCreateRequest,
} from "./OrganizationForm";

const getOrgNameInput = () =>
  screen.getByRole("textbox", {
    name:
      "What's the name of your organization? Organizations have multiple testing facilities or locations as part of their network. required",
  });
const getOrgStateDropdown = () => screen.getByLabelText("Organization state *");
const getOrgTypeDropdown = () => screen.getByLabelText("Organization type *");
const getFirstNameInput = () => screen.getByLabelText("First name *");
const getMiddleNameInput = () => screen.getByLabelText("Middle name");
const getLastNameInput = () => screen.getByLabelText("Last name *");
const getEmailInput = () => screen.getByLabelText("Work email *");
const getPhoneInput = () => screen.getByLabelText("Work phone number *");
const getSubmitButton = () => screen.getByText("Submit");
const fillIn = (input: any, text: string) =>
  act(() => {
    fireEvent.change(input, { target: { value: text } });
  });

const fillInDropDown = (input: any, text: string) =>
  act(() => {
    userEvent.selectOptions(input, [text]);
  });

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
      } else {
        throw new Error("This is an error.");
      }
    },
  },
}));

jest.mock("react-router", () => ({
  Redirect: (props: any) => `Redirected to ${props.to.pathname}`,
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
    fillInDropDown(getOrgStateDropdown(), "AK");
    await act(async () => {
      await getSubmitButton().click();
    });

    expect(
      screen.getByText("Organization name is required")
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
    fillIn(getOrgNameInput(), "Drake");
    fillInDropDown(getOrgStateDropdown(), "TX");
    fillInDropDown(getOrgTypeDropdown(), "Employer");
    fillIn(getFirstNameInput(), "Greatest");
    fillIn(getMiddleNameInput(), "OG");
    fillIn(getLastNameInput(), "Ever");
    fillIn(getEmailInput(), "ever@greatest.com");
    fillIn(getPhoneInput(), "8008675309");
    await act(async () => {
      await getSubmitButton().click();
    });

    expect(
      screen.getByText("Redirected to /sign-up/identity-verification")
    ).toBeInTheDocument();
  });

  it("displays a duplicate org error when submitting a duplicate org", async () => {
    fillIn(getOrgNameInput(), "Duplicate");
    fillInDropDown(getOrgStateDropdown(), "TX");
    fillInDropDown(getOrgTypeDropdown(), "Employer");
    fillIn(getFirstNameInput(), "Greatest");
    fillIn(getMiddleNameInput(), "OG");
    fillIn(getLastNameInput(), "Ever");
    fillIn(getEmailInput(), "ever@greatest.com");
    fillIn(getPhoneInput(), "8008675309");
    await act(async () => {
      await getSubmitButton().click();
    });

    expect(
      screen.getByText(
        "This organization has already registered with SimpleReport.",
        { exact: false }
      )
    ).toBeInTheDocument();
  });

  it("displays a duplicate email error when submitting a duplicate email", async () => {
    fillIn(getOrgNameInput(), "Foo");
    fillInDropDown(getOrgStateDropdown(), "TX");
    fillInDropDown(getOrgTypeDropdown(), "Employer");
    fillIn(getFirstNameInput(), "Greatest");
    fillIn(getMiddleNameInput(), "OG");
    fillIn(getLastNameInput(), "Ever");
    fillIn(getEmailInput(), "duplicate@test.com");
    fillIn(getPhoneInput(), "8008675309");
    await act(async () => {
      await getSubmitButton().click();
    });

    expect(
      screen.getByText(
        "This email address is already registered with SimpleReport.",
        { exact: false }
      )
    ).toBeInTheDocument();
  });
});

import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SignUpApi } from "../SignUpApi";

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
const getEmailInput = () => screen.getByLabelText("Email address *");
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
  SignUpApi: { createOrganization: jest.fn() },
}));

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

  it("calls the create org endpoint when submitting", async () => {
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

    expect(SignUpApi.createOrganization).toHaveBeenCalledWith({
      name: "Drake",
      type: "employer",
      state: "TX",
      firstName: "Greatest",
      middleName: "OG",
      lastName: "Ever",
      email: "ever@greatest.com",
      workPhoneNumber: "8008675309",
    } as OrganizationCreateRequest);
  });
});

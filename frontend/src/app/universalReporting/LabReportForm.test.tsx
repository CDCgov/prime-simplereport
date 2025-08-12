import { fireEvent, render, screen, within } from "@testing-library/react";
import configureStore, { MockStoreEnhanced } from "redux-mock-store";
import { MemoryRouter } from "react-router-dom";
import { MockedProvider } from "@apollo/client/testing";
import { Provider } from "react-redux";
import userEvent from "@testing-library/user-event";

import LabReportForm from "./LabReportForm";

describe("LabReportForm Stepper", () => {
  let store: MockStoreEnhanced<unknown, {}>;
  const mockStore = configureStore([]);
  const renderWithUser = (mocks: any[]) => ({
    user: userEvent.setup(),
    ...render(
      <MemoryRouter>
        <MockedProvider mocks={mocks}>
          <Provider store={store}>
            <LabReportForm />
          </Provider>
        </MockedProvider>
      </MemoryRouter>
    ),
  });

  beforeEach(() => {
    store = mockStore({
      organization: {
        name: "Organization Name",
      },
      facilities: [
        {
          id: "a1",
          name: "Fake Facility",
        },
      ],
      user: {
        permissions: [],
      },
    });
  });

  test("renders stepper with steps", () => {
    renderWithUser([]);
    const stepIndicator = screen.getByTestId("step-indicator");
    const steps = within(stepIndicator).getAllByRole("listitem");
    expect(steps).toHaveLength(5);
    expect(steps[0]).toHaveTextContent("Facility information");
    expect(steps[1]).toHaveTextContent("Provider information");
    expect(steps[2]).toHaveTextContent("Patient information");
    expect(steps[3]).toHaveTextContent("Lab results");
    expect(steps[4]).toHaveTextContent("Review and submit");

    const nextButton = screen.getByRole("button", {
      name: /Next/i,
    });

    expect(nextButton).toHaveTextContent("Next: Provider information");
  });

  test("steps forward and back", () => {
    renderWithUser([]);

    const stepIndicator = screen.getByTestId("step-indicator");

    const currentStep = within(stepIndicator).getByRole("heading");
    expect(currentStep).toHaveTextContent("Facility information");

    const nextButton = screen.getByRole("button", {
      name: /Next/i,
    });
    fireEvent.click(nextButton);

    expect(currentStep).toHaveTextContent("Provider information");

    const backButton = screen.getByRole("button", {
      name: /Back to facility information/i,
    });
    fireEvent.click(backButton);

    expect(currentStep).toHaveTextContent("Facility information");
  });

  test("allows clicking to change step", async () => {
    renderWithUser([]);

    const stepIndicator = screen.getByTestId("step-indicator");
    const currentStep = within(stepIndicator).getByRole("heading");

    const providerStep = within(stepIndicator).getByText(
      "Provider information"
    );
    fireEvent.click(providerStep);
    expect(currentStep).toHaveTextContent("Provider information");

    const patientStep = within(stepIndicator).getByText("Patient information");
    fireEvent.click(patientStep);
    expect(currentStep).toHaveTextContent("Patient information");
    await confirmPatientFormSectionFieldNames();

    const facilityStep = within(stepIndicator).getByText(
      "Facility information"
    );
    fireEvent.click(facilityStep);
    expect(currentStep).toHaveTextContent("Facility information");

    fireEvent.click(patientStep);
    await confirmPatientFormFieldNamesSaved();
  });

  const confirmPatientFormSectionFieldNames = async () => {
    const patientFormSection = screen.getByTestId("patientFormSection");
    const textBoxInputs = within(patientFormSection).getAllByRole("textbox");
    const dropdownInputs = within(patientFormSection).getAllByRole("combobox");
    expect(textBoxInputs).toHaveLength(11);
    expect(dropdownInputs).toHaveLength(3);

    const firstNameInput = textBoxInputs.filter(
      (input) => input.getAttribute("name") === "patient-first-name"
    )[0];
    const middleNameInput = textBoxInputs.filter(
      (input) => input.getAttribute("name") === "patient-middle-name"
    )[0];
    const lastNameInput = textBoxInputs.filter(
      (input) => input.getAttribute("name") === "patient-last-name"
    )[0];
    const patientIdInput = textBoxInputs.filter(
      (input) => input.getAttribute("name") === "patient-id"
    )[0];
    const streetOneInput = textBoxInputs.filter(
      (input) => input.getAttribute("name") === "patient-street-one"
    )[0];
    const streetTwoInput = textBoxInputs.filter(
      (input) => input.getAttribute("name") === "patient-street-two"
    )[0];
    const cityInput = textBoxInputs.filter(
      (input) => input.getAttribute("name") === "patient-city"
    )[0];
    const countyInput = textBoxInputs.filter(
      (input) => input.getAttribute("name") === "patient-county"
    )[0];
    const zipCodeInput = textBoxInputs.filter(
      (input) => input.getAttribute("name") === "patient-zip-code"
    )[0];
    const phoneInput = textBoxInputs.filter(
      (input) => input.getAttribute("name") === "patient-phone"
    )[0];
    const emailInput = textBoxInputs.filter(
      (input) => input.getAttribute("name") === "patient-email"
    )[0];
    // const tribalAffiliationDropdown = dropdownInputs.filter(
    //   (input) => input.getAttribute("id") === "tribal-affiliation"
    // )[0];
    // const countryDropdown = dropdownInputs.filter(
    //   (input) => input.getAttribute("name") === "patient-country"
    // )[0];
    // const stateDropdown = dropdownInputs.filter(
    //   (input) => input.getAttribute("name") === "patient-state"
    // )[0];

    await userEvent.click(firstNameInput);
    await userEvent.keyboard("Firstly");
    await userEvent.click(middleNameInput);
    await userEvent.keyboard("Middleton");
    await userEvent.click(lastNameInput);
    await userEvent.keyboard("Lastly");
    await userEvent.click(patientIdInput);
    await userEvent.keyboard("My Custom Id");
    await userEvent.click(streetOneInput);
    await userEvent.keyboard("My Street 1");
    await userEvent.click(streetTwoInput);
    await userEvent.keyboard("My Street 2");
    await userEvent.click(cityInput);
    await userEvent.keyboard("Baltimore");
    await userEvent.click(countyInput);
    await userEvent.keyboard("Fulton");
    await userEvent.click(zipCodeInput);
    await userEvent.keyboard("30319");
    await userEvent.click(phoneInput);
    await userEvent.keyboard("555-555-5555");
    await userEvent.click(emailInput);
    await userEvent.keyboard("fakeemail@example.com");

    const femaleRadioOption = screen.getAllByLabelText("Female")[0];
    expect(femaleRadioOption).not.toBeChecked();
    await userEvent.click(femaleRadioOption);
    expect(femaleRadioOption).toBeChecked();

    const nativeRadioOption = screen.getAllByLabelText(
      "Native Hawaiian/other Pacific Islander"
    )[0];
    expect(nativeRadioOption).not.toBeChecked();
    await userEvent.click(nativeRadioOption);
    expect(nativeRadioOption).toBeChecked();

    const latinoYesRadioOption = screen.getAllByLabelText("Yes")[0];
    expect(latinoYesRadioOption).not.toBeChecked();
    await userEvent.click(latinoYesRadioOption);
    expect(latinoYesRadioOption).toBeChecked();

    expect(firstNameInput).toHaveValue("Firstly");
    expect(middleNameInput).toHaveValue("Middleton");
    expect(lastNameInput).toHaveValue("Lastly");
    expect(patientIdInput).toHaveValue("My Custom Id");
    expect(streetOneInput).toHaveValue("My Street 1");
    expect(streetTwoInput).toHaveValue("My Street 2");
    expect(cityInput).toHaveValue("Baltimore");
    expect(countyInput).toHaveValue("Fulton");
    expect(zipCodeInput).toHaveValue("30319");
    expect(phoneInput).toHaveValue("555-555-5555");
    expect(emailInput).toHaveValue("fakeemail@example.com");

    expect(patientFormSection).toHaveTextContent("First name");
    expect(patientFormSection).toHaveTextContent("Middle name (optional)");
    expect(patientFormSection).toHaveTextContent("Last name");
    expect(patientFormSection).toHaveTextContent("Date of birth");
    expect(patientFormSection).toHaveTextContent("Patient ID (optional)");
    expect(patientFormSection).toHaveTextContent("Sex");
    expect(patientFormSection).toHaveTextContent("Female");
    expect(patientFormSection).toHaveTextContent("Male");
    expect(patientFormSection).toHaveTextContent("Race");
    expect(patientFormSection).toHaveTextContent(
      "American Indian/Alaskan Native"
    );
    expect(patientFormSection).toHaveTextContent("Asian");
    expect(patientFormSection).toHaveTextContent("Black/African American");
    expect(patientFormSection).toHaveTextContent(
      "Native Hawaiian/other Pacific Islander"
    );
    expect(patientFormSection).toHaveTextContent("White");
    expect(patientFormSection).toHaveTextContent("Other");
    const unknownLabels = screen.getAllByText("Unknown");
    expect(unknownLabels).toHaveLength(2);
    expect(patientFormSection).toHaveTextContent(
      "Is the patient Hispanic or Latino?"
    );
    expect(patientFormSection).toHaveTextContent("Yes");
    expect(patientFormSection).toHaveTextContent("No");
    expect(patientFormSection).toHaveTextContent(
      "Tribal affiliation (optional)"
    );
    expect(patientFormSection).toHaveTextContent("Patient contact");
    expect(patientFormSection).toHaveTextContent("Street address");
    expect(patientFormSection).toHaveTextContent("Apt, suite, etc (optional)");
    expect(patientFormSection).toHaveTextContent("City");
    expect(patientFormSection).toHaveTextContent("County (optional)");
    expect(patientFormSection).toHaveTextContent("Country");
    expect(patientFormSection).toHaveTextContent("United States");
    expect(patientFormSection).toHaveTextContent("State");
    expect(patientFormSection).toHaveTextContent("ZIP code");
    expect(patientFormSection).toHaveTextContent("Phone number (optional)");
    expect(patientFormSection).toHaveTextContent("Email address (optional)");
  };

  const confirmPatientFormFieldNamesSaved = async () => {
    const patientFormSection = screen.getByTestId("patientFormSection");
    const textBoxInputs = within(patientFormSection).getAllByRole("textbox");
    const dropdownInputs = within(patientFormSection).getAllByRole("combobox");
    expect(textBoxInputs).toHaveLength(11);
    expect(dropdownInputs).toHaveLength(3);

    const firstNameInput = textBoxInputs.filter(
      (input) => input.getAttribute("name") === "patient-first-name"
    )[0];
    const middleNameInput = textBoxInputs.filter(
      (input) => input.getAttribute("name") === "patient-middle-name"
    )[0];
    const lastNameInput = textBoxInputs.filter(
      (input) => input.getAttribute("name") === "patient-last-name"
    )[0];
    const patientIdInput = textBoxInputs.filter(
      (input) => input.getAttribute("name") === "patient-id"
    )[0];
    const streetOneInput = textBoxInputs.filter(
      (input) => input.getAttribute("name") === "patient-street-one"
    )[0];
    const streetTwoInput = textBoxInputs.filter(
      (input) => input.getAttribute("name") === "patient-street-two"
    )[0];
    const cityInput = textBoxInputs.filter(
      (input) => input.getAttribute("name") === "patient-city"
    )[0];
    const countyInput = textBoxInputs.filter(
      (input) => input.getAttribute("name") === "patient-county"
    )[0];
    const zipCodeInput = textBoxInputs.filter(
      (input) => input.getAttribute("name") === "patient-zip-code"
    )[0];
    const phoneInput = textBoxInputs.filter(
      (input) => input.getAttribute("name") === "patient-phone"
    )[0];
    const emailInput = textBoxInputs.filter(
      (input) => input.getAttribute("name") === "patient-email"
    )[0];

    expect(firstNameInput).toHaveValue("Firstly");
    expect(middleNameInput).toHaveValue("Middleton");
    expect(lastNameInput).toHaveValue("Lastly");
    expect(patientIdInput).toHaveValue("My Custom Id");
    expect(streetOneInput).toHaveValue("My Street 1");
    expect(streetTwoInput).toHaveValue("My Street 2");
    expect(cityInput).toHaveValue("Baltimore");
    expect(countyInput).toHaveValue("Fulton");
    expect(zipCodeInput).toHaveValue("30319");
    expect(phoneInput).toHaveValue("555-555-5555");
    expect(emailInput).toHaveValue("fakeemail@example.com");
  };
});

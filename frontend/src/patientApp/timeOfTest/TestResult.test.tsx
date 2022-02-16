import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { render, screen, within } from "@testing-library/react";

import TestResult from "./TestResult";
import "../../i18n";

const mockStore = configureStore([]);

const getPatientLinkData = (result: string) => ({
  testEventId: "4606e571-8249-479e-94ab-e2f311713a5f",
  result: result,
  dateTested: "2022-02-11T21:16:26.404+00:00",
  correctionStatus: "ORIGINAL",
  patient: {
    firstName: "Bob",
    lastName: "Barker",
    middleName: "M",
    birthDate: "1899-05-10",
  },
  organization: {
    name: "The Mall",
  },
  facility: {
    name: "Imaginary Site",
    cliaNumber: "123456",
    street: "736 Jackson PI NW",
    streetTwo: "",
    city: "Washington",
    state: "DC",
    zipCode: "20503",
    phone: "555-867-5309",
    orderingProvider: {
      firstName: "Doctor",
      lastName: "Doom",
      middleName: "",
      npi: "DOOOOOOM",
    },
  },
  deviceType: {
    name: "Abbott BinaxNOW (Antigen)",
    model: "BinaxNOW COVID-19 Ag Card",
  },
});

describe("TestResult", () => {
  it("should show the patient/device name", () => {
    const store = mockStore({ testResult: getPatientLinkData("UNDETERMINED") });
    render(
      <Provider store={store}>
        <TestResult />
      </Provider>
    );

    const patientApp = screen.getByTestId("patient-app");

    expect(
      within(patientApp).getByText("SARS-CoV-2 result")
    ).toBeInTheDocument();
    expect(
      within(patientApp).getByText("Abbott BinaxNOW (Antigen)")
    ).toBeInTheDocument();
    expect(within(patientApp).getByText("Bob M Barker")).toBeInTheDocument();
    expect(within(patientApp).getByText("Test result")).toBeInTheDocument();
    expect(within(patientApp).getByText("Download result")).toBeInTheDocument();
  });
  it("should show a positive result", () => {
    const store = mockStore({ testResult: getPatientLinkData("POSITIVE") });
    render(
      <Provider store={store}>
        <TestResult />
      </Provider>
    );

    const patientApp = screen.getByTestId("patient-app");

    expect(
      within(patientApp).getByText("SARS-CoV-2 result")
    ).toBeInTheDocument();
    expect(within(patientApp).getByText("Positive")).toBeInTheDocument();
  });
  it("should show a negative result", () => {
    const store = mockStore({ testResult: getPatientLinkData("NEGATIVE") });
    render(
      <Provider store={store}>
        <TestResult />
      </Provider>
    );

    const patientApp = screen.getByTestId("patient-app");

    expect(
      within(patientApp).getByText("SARS-CoV-2 result")
    ).toBeInTheDocument();
    expect(within(patientApp).getByText("Negative")).toBeInTheDocument();
  });
  it("should show an inconclusive result", () => {
    const store = mockStore({ testResult: getPatientLinkData("UNDETERMINED") });
    render(
      <Provider store={store}>
        <TestResult />
      </Provider>
    );

    const patientApp = screen.getByTestId("patient-app");

    expect(
      within(patientApp).getByText("SARS-CoV-2 result")
    ).toBeInTheDocument();
    expect(within(patientApp).getByText("Inconclusive")).toBeInTheDocument();
  });
});

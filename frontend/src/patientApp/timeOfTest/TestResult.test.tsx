import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { render, screen, within } from "@testing-library/react";

import TestResult from "./TestResult";
import "../../i18n";

const mockStore = configureStore([]);

let getPatientLinkData = (results: MultiplexResult[]) => ({
  testEventId: "4606e571-8249-479e-94ab-e2f311713a5f",
  results: results as MultiplexResult[],
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

describe("TestResult - COVID-19 only", () => {
  it("should show the patient/device name", () => {
    const results = [
      { disease: { name: "COVID-19" }, testResult: "UNDETERMINED" },
    ] as MultiplexResult[];
    const store = mockStore({ testResult: getPatientLinkData(results) });
    render(
      <Provider store={store}>
        <TestResult />
      </Provider>
    );

    const patientApp = screen.getByTestId("patient-app");

    expect(
      within(patientApp).getByText("Test result: COVID-19")
    ).toBeInTheDocument();
    expect(
      within(patientApp).getByText("Abbott BinaxNOW (Antigen)")
    ).toBeInTheDocument();
    expect(within(patientApp).getByText("Bob M Barker")).toBeInTheDocument();
    expect(within(patientApp).getByText("COVID-19 result")).toBeInTheDocument();
    expect(within(patientApp).getByText("Download result")).toBeInTheDocument();
  });
  it("should show a positive result", () => {
    const results = [
      { disease: { name: "COVID-19" }, testResult: "POSITIVE" },
    ] as MultiplexResult[];
    const store = mockStore({ testResult: getPatientLinkData(results) });
    render(
      <Provider store={store}>
        <TestResult />
      </Provider>
    );

    const patientApp = screen.getByTestId("patient-app");

    expect(
      within(patientApp).getByText("Test result: COVID-19")
    ).toBeInTheDocument();
    expect(within(patientApp).getByText("Positive")).toBeInTheDocument();
  });
  it("should show a negative result", () => {
    const results = [
      { disease: { name: "COVID-19" }, testResult: "NEGATIVE" },
    ] as MultiplexResult[];
    const store = mockStore({ testResult: getPatientLinkData(results) });
    render(
      <Provider store={store}>
        <TestResult />
      </Provider>
    );

    const patientApp = screen.getByTestId("patient-app");

    expect(
      within(patientApp).getByText("Test result: COVID-19")
    ).toBeInTheDocument();
    expect(within(patientApp).getByText("Negative")).toBeInTheDocument();
  });
  it("should show an inconclusive result", () => {
    const results = [
      { disease: { name: "COVID-19" }, testResult: "UNDETERMINED" },
    ] as MultiplexResult[];
    const store = mockStore({ testResult: getPatientLinkData(results) });
    render(
      <Provider store={store}>
        <TestResult />
      </Provider>
    );

    const patientApp = screen.getByTestId("patient-app");

    expect(
      within(patientApp).getByText("Test result: COVID-19")
    ).toBeInTheDocument();
    expect(within(patientApp).getByText("Inconclusive")).toBeInTheDocument();
  });
});

if (import.meta.env.VITE_MULTIPLEX_ENABLE) {
  describe("TestResult - Multiplex", () => {
    it("should show the results for positive COVID-19 and negative Flu", () => {
      const results = [
        { disease: { name: "Flu B" }, testResult: "NEGATIVE" },
        { disease: { name: "Flu A" }, testResult: "NEGATIVE" },
        { disease: { name: "COVID-19" }, testResult: "POSITIVE" },
      ] as MultiplexResult[];
      const store = mockStore({ testResult: getPatientLinkData(results) });
      render(
        <Provider store={store}>
          <TestResult />
        </Provider>
      );

      const patientApp = screen.getByTestId("patient-app");
      expect(
        within(patientApp).getByText("Test results: COVID-19 and flu")
      ).toBeInTheDocument();
      expect(within(patientApp).getByText("COVID-19")).toBeInTheDocument();
      expect(within(patientApp).getByText("Flu A")).toBeInTheDocument();
      expect(within(patientApp).getByText("Flu B")).toBeInTheDocument();
      expect(within(patientApp).getByText("Positive")).toBeInTheDocument();
      expect(within(patientApp).getAllByText("Negative")).toHaveLength(2);
    });

    it("should show the results for negative COVID-19 and positive Flu", () => {
      const results = [
        { disease: { name: "Flu B" }, testResult: "POSITIVE" },
        { disease: { name: "Flu A" }, testResult: "POSITIVE" },
        { disease: { name: "COVID-19" }, testResult: "NEGATIVE" },
      ] as MultiplexResult[];
      const store = mockStore({ testResult: getPatientLinkData(results) });
      render(
        <Provider store={store}>
          <TestResult />
        </Provider>
      );

      const patientApp = screen.getByTestId("patient-app");
      expect(
        within(patientApp).getByText("Test results: COVID-19 and flu")
      ).toBeInTheDocument();
      expect(within(patientApp).getByText("COVID-19")).toBeInTheDocument();
      expect(within(patientApp).getByText("Flu A")).toBeInTheDocument();
      expect(within(patientApp).getByText("Flu B")).toBeInTheDocument();
      expect(within(patientApp).getAllByText("Positive")).toHaveLength(2);
      expect(within(patientApp).getByText("Negative")).toBeInTheDocument();
      expect(within(patientApp).getByText("For COVID-19:")).toBeInTheDocument();
      expect(
        within(patientApp).getByText("For flu A and B:")
      ).toBeInTheDocument();
    });

    it("should show the results for undetermined COVID-19 and Flu", () => {
      const results = [
        { disease: { name: "Flu B" }, testResult: "UNDETERMINED" },
        { disease: { name: "Flu A" }, testResult: "UNDETERMINED" },
        { disease: { name: "COVID-19" }, testResult: "UNDETERMINED" },
      ] as MultiplexResult[];
      const store = mockStore({ testResult: getPatientLinkData(results) });
      render(
        <Provider store={store}>
          <TestResult />
        </Provider>
      );

      const patientApp = screen.getByTestId("patient-app");
      expect(
        within(patientApp).getByText("Test results: COVID-19 and flu")
      ).toBeInTheDocument();
      expect(within(patientApp).getByText("COVID-19")).toBeInTheDocument();
      expect(within(patientApp).getByText("Flu A")).toBeInTheDocument();
      expect(within(patientApp).getByText("Flu B")).toBeInTheDocument();
      expect(within(patientApp).getAllByText("Inconclusive")).toHaveLength(3);
    });
  });
}

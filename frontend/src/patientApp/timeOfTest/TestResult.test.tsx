import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { Router } from "react-router-dom";
import { createMemoryHistory } from "history";
import { render, screen } from "@testing-library/react";

import TestResult from "./TestResult";
import "../../i18n";

const mockStore = configureStore([]);

const getPatientLinkData = (result: string) => ({
  plid: "foo",
  patient: {
    firstName: "Bob",
    lastName: "Barker",
    lastTest: {
      deviceTypeName: "Abbott BinaxNOW (Antigen)",
      deviceTypeModel: "BinaxNOW COVID-19 Ag Card",
      dateTested: "08/27/2020",
      result: result,
    },
  },
});

describe("TestResult", () => {
  it("should show the patient/device name", () => {
    const store = mockStore(getPatientLinkData("UNDETERMINED"));
    render(
      <Router history={createMemoryHistory()}>
        <Provider store={store}>
          <TestResult />
        </Provider>
      </Router>
    );

    expect(screen.getByText("SARS-CoV-2 result")).toBeInTheDocument();
    expect(screen.getByText("Abbott BinaxNOW (Antigen)")).toBeInTheDocument();
    expect(screen.getByText("Bob Barker")).toBeInTheDocument();
    expect(screen.getByText("Test result")).toBeInTheDocument();
  });
  it("should show a positive result", () => {
    const store = mockStore(getPatientLinkData("POSITIVE"));
    render(
      <Router history={createMemoryHistory()}>
        <Provider store={store}>
          <TestResult />
        </Provider>
      </Router>
    );

    expect(screen.getByText("SARS-CoV-2 result")).toBeInTheDocument();
    expect(screen.getByText("Positive")).toBeInTheDocument();
  });
  it("should show a negative result", () => {
    const store = mockStore(getPatientLinkData("NEGATIVE"));
    render(
      <Router history={createMemoryHistory()}>
        <Provider store={store}>
          <TestResult />
        </Provider>
      </Router>
    );

    expect(screen.getByText("SARS-CoV-2 result")).toBeInTheDocument();
    expect(screen.getByText("Negative")).toBeInTheDocument();
  });
  it("should show an inconclusive result", () => {
    const store = mockStore(getPatientLinkData("UNDETERMINED"));
    render(
      <Router history={createMemoryHistory()}>
        <Provider store={store}>
          <TestResult />
        </Provider>
      </Router>
    );

    expect(screen.getByText("SARS-CoV-2 result")).toBeInTheDocument();
    expect(screen.getByText("Inconclusive")).toBeInTheDocument();
  });
});

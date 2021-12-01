import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { Router } from "react-router-dom";
import { createMemoryHistory } from "history";
import { render, screen } from "@testing-library/react";

import TestResult from "./TestResult";
import "../../i18n";

const mockStore = configureStore([]);

describe("TestResult", () => {
  it("should show a positive result", () => {
    const store = mockStore({
      plid: "foo",
      patient: {
        firstName: "Bob",
        lastName: "Barker",
        lastTest: {
          deviceTypeModel: "Testing device",
          dateTested: "08/27/2020",
          result: "POSITIVE",
        },
      },
    });
    render(
      <Router history={createMemoryHistory()}>
        <Provider store={store}>
          <TestResult />
        </Provider>
      </Router>
    );

    expect(screen.getByText("SARS-CoV-2 result")).toBeInTheDocument();
    expect(screen.getByText("Bob Barker")).toBeInTheDocument();
    expect(screen.getByText("Test result")).toBeInTheDocument();
    expect(screen.getByText("Positive")).toBeInTheDocument();
  });
  it("should show a negative result", () => {
    const store = mockStore({
      plid: "foo",
      patient: {
        firstName: "Bob",
        lastName: "Barker",
        lastTest: {
          deviceType: "Testing device",
          dateTested: "08/27/2020",
          result: "NEGATIVE",
        },
      },
    });
    render(
      <Router history={createMemoryHistory()}>
        <Provider store={store}>
          <TestResult />
        </Provider>
      </Router>
    );

    expect(screen.getByText("SARS-CoV-2 result")).toBeInTheDocument();
    expect(screen.getByText("Bob Barker")).toBeInTheDocument();
    expect(screen.getByText("Test result")).toBeInTheDocument();
    expect(screen.getByText("Negative")).toBeInTheDocument();
  });
  it("should show an inconclusive result", () => {
    const store = mockStore({
      plid: "foo",
      patient: {
        firstName: "Bob",
        lastName: "Barker",
        lastTest: {
          deviceType: "Testing device",
          dateTested: "08/27/2020",
          result: "UNDETERMINED",
        },
      },
    });
    render(
      <Router history={createMemoryHistory()}>
        <Provider store={store}>
          <TestResult />
        </Provider>
      </Router>
    );

    expect(screen.getByText("SARS-CoV-2 result")).toBeInTheDocument();
    expect(screen.getByText("Bob Barker")).toBeInTheDocument();
    expect(screen.getByText("Test result")).toBeInTheDocument();
    expect(screen.getByText("Inconclusive")).toBeInTheDocument();
  });
});

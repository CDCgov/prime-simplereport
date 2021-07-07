import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { Router } from "react-router-dom";
import { createMemoryHistory } from "history";
import { render } from "@testing-library/react";

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
    const { container, getByText } = render(
      <Router history={createMemoryHistory()}>
        <Provider store={store}>
          <TestResult />
        </Provider>
      </Router>
    );

    expect(getByText("SARS-CoV-2 result")).toBeInTheDocument();
    expect(getByText("Bob Barker")).toBeInTheDocument();
    expect(getByText("Test result")).toBeInTheDocument();
    expect(getByText("Positive")).toBeInTheDocument();
    expect(container).toMatchSnapshot();
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
    const { container, getByText } = render(
      <Router history={createMemoryHistory()}>
        <Provider store={store}>
          <TestResult />
        </Provider>
      </Router>
    );

    expect(getByText("SARS-CoV-2 result")).toBeInTheDocument();
    expect(getByText("Bob Barker")).toBeInTheDocument();
    expect(getByText("Test result")).toBeInTheDocument();
    expect(getByText("Negative")).toBeInTheDocument();
    expect(container).toMatchSnapshot();
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
    const { container, getByText } = render(
      <Router history={createMemoryHistory()}>
        <Provider store={store}>
          <TestResult />
        </Provider>
      </Router>
    );

    expect(getByText("SARS-CoV-2 result")).toBeInTheDocument();
    expect(getByText("Bob Barker")).toBeInTheDocument();
    expect(getByText("Test result")).toBeInTheDocument();
    expect(getByText("Inconclusive")).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });
});

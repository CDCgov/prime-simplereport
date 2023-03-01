import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";

import { getAppInsights } from "../app/TelemetryService";

import PatientApp from "./PatientApp";

jest.mock("../app/TelemetryService", () => ({
  getAppInsights: jest.fn(),
  getAppInsightsHeaders: jest.fn(),
}));

describe("PatientApp", () => {
  let mockStore: any;
  let store: any;
  let setAuthenticatedUserContextMock: any;
  let clearAuthenticatedUserContextMock: any;

  beforeEach(() => {
    mockStore = configureStore([]);
  });

  describe("telemetry", () => {
    it("does not set the authenticated user context when not given the plid", () => {
      setAuthenticatedUserContextMock = jest.fn();
      clearAuthenticatedUserContextMock = jest.fn();

      store = mockStore({
        testResult: {
          testEventId: "fake-test-event-id",
        },
      });
      (getAppInsights as jest.Mock).mockImplementation(() => ({
        setAuthenticatedUserContext: setAuthenticatedUserContextMock,
        clearAuthenticatedUserContext: clearAuthenticatedUserContextMock,
      }));
      render(
        <MemoryRouter>
          <Provider store={store}>
            <PatientApp />
          </Provider>
        </MemoryRouter>
      );
      expect(clearAuthenticatedUserContextMock).toHaveBeenCalledTimes(0);
      expect(setAuthenticatedUserContextMock).toHaveBeenCalledTimes(0);
    });

    it("sets the authenticated user context as the plid when given the plid", () => {
      setAuthenticatedUserContextMock = jest.fn();
      store = mockStore({
        plid: "fake-plid",
        testResult: {
          testEventId: "fake-test-event-id",
        },
      });
      (getAppInsights as jest.Mock).mockImplementation(() => ({
        setAuthenticatedUserContext: setAuthenticatedUserContextMock,
        clearAuthenticatedUserContext: clearAuthenticatedUserContextMock,
      }));
      render(
        <MemoryRouter>
          <Provider store={store}>
            <PatientApp />
          </Provider>
        </MemoryRouter>
      );
      expect(clearAuthenticatedUserContextMock).toHaveBeenCalledTimes(1);
      expect(setAuthenticatedUserContextMock).toHaveBeenCalledWith(
        "fake-plid",
        undefined,
        true
      );
    });
  });
});

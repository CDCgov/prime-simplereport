import React from "react";
import { render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import createMockStore from "redux-mock-store";
import * as ReactRouterDomMock from "react-router";

import * as AppInsightsMock from "../TelemetryService";

import { AccountCreationApi } from "./AccountCreationApiService";
import AccountCreationApp from "./AccountCreationApp";
import { UserAccountStatus } from "./UserAccountStatus";

describe("Account Creation App", () => {
  const mockStore = createMockStore([]);
  const store = mockStore({});

  const renderWithMocks = () =>
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/uac/"]}>
          <Routes>
            <Route path="/uac/*" element={<AccountCreationApp />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

  it("Renders and saves viewport metric for status UNKNOWN", async () => {
    const userAcctStatusMock = UserAccountStatus.UNKNOWN as UserAccountStatus;
    jest
      .spyOn(AccountCreationApi, "getUserStatus")
      .mockResolvedValue(userAcctStatusMock);

    const trackMetricMock = jest.fn();
    Object.defineProperty(global, "visualViewport", {
      value: { width: 1200, height: 800 },
    });
    const getAppInsightsSpy = jest
      .spyOn(AppInsightsMock, "getAppInsights")
      .mockImplementation(
        () => ({ trackMetric: trackMetricMock } as jest.MockedObject<any>)
      );

    const navigateMock = jest.fn();
    jest.spyOn(ReactRouterDomMock, "useNavigate").mockReturnValue(navigateMock);

    renderWithMocks();

    await waitFor(() =>
      expect(trackMetricMock).toHaveBeenCalledWith(
        {
          name: "userViewport_accountCreation",
          average: 1200,
        },
        {
          width: 1200,
          height: 800,
        }
      )
    );

    await waitFor(() =>
      expect(navigateMock).toHaveBeenCalledWith("/uac/not-found")
    );
    getAppInsightsSpy.mockRestore();
  });
});

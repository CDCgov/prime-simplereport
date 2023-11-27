import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MockedProvider } from "@apollo/client/testing";
import {
  createMemoryRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import userEvent from "@testing-library/user-event";
import React from "react";

import AddPatient, { PATIENT_EXISTS } from "./AddPatient";
import { fillOutForm, mockFacilityID, store } from "./AddPatientTestUtils";

// These tests have been broken down into multiple files so they can execute in parallel
describe("Add Patient: when attempting to create an existing patient ", () => {
  const routes = createRoutesFromElements(
    <>
      <Route element={<AddPatient />} path={"/add-patient"} />
      <Route element={<p>Patients!</p>} path={"/patient"} />
    </>
  );
  const router = createMemoryRouter(routes, {
    initialEntries: [`/add-patient?facility=${mockFacilityID}`],
  });
  const renderWithUser = (mocks: any[]) => ({
    user: userEvent.setup(),
    ...render(
      <Provider store={store}>
        <MockedProvider mocks={mocks}>
          <RouterProvider router={router} />
        </MockedProvider>
      </Provider>
    ),
  });
  it("does not open modal if no patient with matching data exists", async () => {
    let patientExistsMock = jest.fn();
    const mocks = [
      {
        request: {
          query: PATIENT_EXISTS,
          variables: {
            firstName: "Alice",
            lastName: "Hamilton",
            birthDate: "1970-09-22",
            facilityId: mockFacilityID,
          },
        },
        result: () => {
          patientExistsMock();
          return {
            data: {
              patientExistsWithoutZip: false,
            },
          };
        },
      },
    ];

    const { user } = renderWithUser(mocks);

    await fillOutForm(
      {
        "First Name": "Alice",
        "Last Name": "Hamilton",
      },
      { Facility: mockFacilityID },
      {}
    );

    // The duplicate patient check is triggered on-blur from one of the identifying data fields
    await user.click(screen.getByLabelText("Date of birth", { exact: false }));
    await user.paste("1970-09-22");
    await user.tab();

    await waitFor(() => {
      expect(patientExistsMock).toHaveBeenCalledTimes(1);
    });

    expect(
      screen.queryByText("This patient is already registered", {
        exact: false,
      })
    ).not.toBeInTheDocument();
  });

  it("displays modal when all identifying data fields have been entered with an existing patient's data", async () => {
    const mocks = [
      {
        request: {
          query: PATIENT_EXISTS,
          variables: {
            firstName: "Alice",
            lastName: "Hamilton",
            birthDate: "1970-09-22",
            facilityId: mockFacilityID,
          },
        },
        result: {
          data: {
            patientExistsWithoutZip: true,
          },
        },
      },
    ];

    const { user } = renderWithUser(mocks);

    await fillOutForm(
      {
        "First Name": "Alice",
        "Last Name": "Hamilton",
      },
      { Facility: mockFacilityID },
      {}
    );

    // The duplicate patient check is triggered on-blur from one of the identifying data fields
    await user.click(screen.getByLabelText("Date of birth", { exact: false }));
    await user.paste("1970-09-22");
    await user.tab();

    expect(
      await screen.findByText("This patient is already registered", {
        exact: false,
      })
    ).toBeInTheDocument();
  });
});

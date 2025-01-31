import configureStore from "redux-mock-store";
import {
  createMemoryRouter,
  createRoutesFromElements,
  MemoryRouter,
  Route,
  RouterProvider,
  Routes,
  useLocation,
} from "react-router-dom";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { Provider } from "react-redux";
import { MockedProvider } from "@apollo/client/testing";

import { createGQLWrappedMemoryRouterWithDataApis } from "../utils/reactRouter";
import SRToastContainer from "../commonComponents/SRToastContainer";

import AddPatient, { ADD_PATIENT, PATIENT_EXISTS } from "./AddPatient";

export const mockFacilityID = "b0d2041f-93c9-4192-b19a-dd99c0044a7e";
export const mockStore = configureStore([]);
export const store = mockStore({
  facilities: [{ id: mockFacilityID, name: "123" }],
  organization: { name: "Test Organization" },
});

export const fillOutForm = async (
  inputs: { [label: string]: string },
  dropdowns: { [label: string]: string },
  inputGroups: {
    [legend: string]: { label: string; value: string; exact?: boolean };
  }
) => {
  const inputElements = Object.entries(inputs);

  for (const [label, value] of inputElements) {
    fireEvent.change(
      screen.getByLabelText(label, {
        exact: false,
      }),
      { target: { value } }
    );
  }

  const dropDownElements = Object.entries(dropdowns);

  for (const [label, value] of dropDownElements) {
    fireEvent.change(
      screen.getByLabelText(label, {
        exact: false,
      }),
      { target: { value } }
    );
  }

  const inputGroupsElements = Object.entries(inputGroups);

  for (const [legend, { label, exact }] of inputGroupsElements) {
    const fieldset = screen
      .getByText(legend, {
        exact: true,
      })
      .closest("fieldset");
    if (fieldset === null) {
      throw Error(`Unable to corresponding fieldset for ${legend}`);
    }
    fireEvent.click(
      within(fieldset).getByLabelText(label, {
        exact: exact ?? false,
      })
    );
  }
};

const elementToRender = createGQLWrappedMemoryRouterWithDataApis(
  <AddPatient />,
  store,
  [],
  false
);
export const renderWithUserNoFacility = () => ({
  user: userEvent.setup(),
  ...render(elementToRender),
});

const addPatientRequestParams = {
  firstName: "Alice",
  middleName: null,
  lastName: "Hamilton",
  lookupId: null,
  birthDate: "1970-09-22",
  street: "25 Shattuck St",
  streetTwo: null,
  city: "Boston",
  state: "MA",
  zipCode: "02115",
  notes: "Green tent",
  country: "USA",
  telephone: null,
  phoneNumbers: [
    {
      type: "MOBILE",
      number: "617-432-1000",
    },
  ],
  role: null,
  emails: ["foo@bar.org"],
  county: "",
  race: "other",
  ethnicity: "refused",
  gender: "female",
  facilityId: mockFacilityID,
  preferredLanguage: null,
  testResultDelivery: "SMS",
  unknownAddress: false,
  unknownPhoneNumber: false,
};

const addPatientRequestNoDelivery = {
  ...addPatientRequestParams,
  testResultDelivery: null,
};

const addPatientRequestNoAddressValidation = {
  ...addPatientRequestParams,
  county: null,
};

const mocks = [
  {
    request: {
      query: PATIENT_EXISTS,
      variables: {
        firstName: "Alice",
        lastName: "Hamilton",
        birthDate: "1970-09-22",
        facilityId: "b0d2041f-93c9-4192-b19a-dd99c0044a7e",
      },
    },
    result: {
      data: {
        patientExistsWithoutZip: false,
      },
    },
  },
  {
    request: {
      query: PATIENT_EXISTS,
      variables: {
        firstName: "Alice",
        lastName: "Hamilton",
        birthDate: "1970-09-22",
        facilityId: "",
      },
    },
    result: {
      data: {
        patientExistsWithoutZip: false,
      },
    },
  },
  {
    request: {
      query: ADD_PATIENT,
      variables: addPatientRequestParams,
    },
    result: {
      data: {
        addPatient: {
          internalId: "153f661f-b6ea-4711-b9ab-487b95198cce",
          facility: {
            id: "facility-id-001",
          },
        },
      },
    },
  },
  {
    request: {
      query: ADD_PATIENT,
      variables: addPatientRequestNoDelivery,
    },
    result: {
      data: {
        addPatient: {
          internalId: "153f661f-b6ea-4711-b9ab-487b95198cce",
          facility: {
            id: "facility-id-001",
          },
        },
      },
    },
  },
  {
    request: {
      query: ADD_PATIENT,
      variables: addPatientRequestNoAddressValidation,
    },
    result: {
      data: {
        addPatient: {
          internalId: "153f661f-b6ea-4711-b9ab-487b95198cce",
          facility: {
            id: "facility-id-001",
          },
        },
      },
    },
  },
];

type LocationOptions = {
  search: string;
  pathname: string;
  state: {
    patientId: string;
  };
};
const Queue = () => {
  const location = useLocation() as LocationOptions;

  return (
    <p>
      Testing Queue! {location.search} {location.state.patientId}
    </p>
  );
};

export const RouterWithFacility: React.FC<RouterWithFacilityProps> = ({
  children,
}) => (
  <MemoryRouter initialEntries={[`/add-patient?facility=${mockFacilityID}`]}>
    <Routes>{children}</Routes>
  </MemoryRouter>
);

const routes = createRoutesFromElements(
  <>
    <Route element={<AddPatient />} path={"/add-patient"} />
    <Route element={<p>Patients!</p>} path={"/patient"} />
    <Route element={<Queue />} path={"/queue"} />
  </>
);
const router = createMemoryRouter(routes, {
  initialEntries: [`/add-patient?facility=${mockFacilityID}`],
});

export const renderWithUserWithFacility = () => ({
  user: userEvent.setup(),
  ...render(
    <>
      <Provider store={store}>
        <MockedProvider mocks={mocks}>
          <RouterProvider router={router} />
        </MockedProvider>
      </Provider>
      <SRToastContainer />
    </>
  ),
});

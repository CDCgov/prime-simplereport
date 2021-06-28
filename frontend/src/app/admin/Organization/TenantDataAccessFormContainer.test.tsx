import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { Provider } from "react-redux";
import { MockedProvider } from "@apollo/client/testing";
import configureStore from "redux-mock-store";

import TenantDataAccessFormContainer, {
  GET_ORGANIZATIONS_QUERY,
  SET_TENANT_DATA_ACCESS,
} from "./TenantDataAccessFormContainer";
import { Props as TenantDataAccessFormProps } from "./TenantDataAccessForm";

const params = {
  organizationExternalId: "ORG_1",
  justification: "sample justification text",
};

jest.mock("./TenantDataAccessForm", () => {
  return (p: TenantDataAccessFormProps) => {
    return (
      <button
        type="submit"
        onClick={() =>
          p.saveTenantDataAccess(
            params.organizationExternalId,
            params.justification
          )
        }
      >
        I'm a magic fake button click me please
      </button>
    );
  };
});
jest.mock("react-router-dom", () => ({
  Redirect: () => <p>Redirected</p>,
}));

const store = configureStore([])({
  organization: {
    name: null,
  },
  user: {
    firstName: "Kim",
    lastName: "Mendoza",
    isAdmin: true,
  },
  facilities: [],
  facility: null,
});

const mocks = [
  {
    request: {
      query: GET_ORGANIZATIONS_QUERY,
    },
    result: {
      data: {
        organizations: [
          { name: "Org 1 Name", externalId: "ORG_1" },
          { name: "Org 2 Name", externalId: "ORG_2" },
        ],
      },
    },
  },
  {
    request: {
      query: SET_TENANT_DATA_ACCESS,
      variables: {
        organizationExternalId: "ORG_1",
        justification: "sample justification text",
      },
    },
    result: {
      data: {
        id: "e2255aa4-cdbd-4429-859e-9dc642624301",
        email: "sample@user.com",
        permissions: [
          "EDIT_FACILITY",
          "EDIT_PATIENT",
          "MANAGE_USERS",
          "READ_PATIENT_LIST",
          "UPDATE_TEST",
          "ARCHIVE_PATIENT",
          "SUBMIT_TEST",
          "READ_RESULT_LIST",
          "EDIT_ORGANIZATION",
          "ACCESS_ALL_FACILITIES",
          "SEARCH_PATIENTS",
          "START_TEST",
          "READ_ARCHIVED_PATIENT_LIST",
        ],
        role: "ADMIN",
        organization: {
          name: "Org 1 Name",
          externalId: "ORG_1",
        },
      },
    },
  },
];

describe("TenantDataAccessFormContainer", () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
        <Provider store={store}>
          <MockedProvider mocks={mocks}>
            <TenantDataAccessFormContainer />
          </MockedProvider>
        </Provider>
      </MemoryRouter>
    );
  });

  it("Redirects on successful save", async () => {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
      await fireEvent.click(screen.getByRole("button"));
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(await screen.findByText("Redirected")).toBeDefined();
    });
  });
});

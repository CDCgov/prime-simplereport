import React from "react";
import {
  act,
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MockedProvider, MockedProviderProps } from "@apollo/client/testing";
import createMockStore from "redux-mock-store";
import { GraphQLError } from "graphql/error";

import {
  GetOrganizationsDocument,
  GetOrganizationWithFacilitiesDocument,
} from "../../../generated/graphql";
import * as srToast from "../../utils/srToast";

import UnarchivePatientContainer, {
  UnarchivePatientOrganization,
  UnarchivePatientFacility,
} from "./UnarchivePatientContainer";

const mockFacility1: UnarchivePatientFacility = {
  id: "bc0536e-4564-4291-bbf3-0e7b0731f9e8",
  name: "Mars Facility",
};
const mockFacility2: UnarchivePatientFacility = {
  id: "d70bb3b3-96bd-40d1-a3ce-b266a7edb91d",
  name: "Jupiter Facility",
};

const mockOrg1: UnarchivePatientOrganization = {
  internalId: "f34183c4-b4c5-449f-98b0-2e02abb7aae0",
  externalId: "DC-Space-Camp-f34183c4-b4c5-449f-98b0-2e02abb7aae0",
  name: "Space Org",
  facilities: [mockFacility1, mockFacility2],
};
const mockOrg2: UnarchivePatientOrganization = {
  internalId: "h3781038-b4c5-449f-98b0-2e02abb7aae0",
  externalId: "DC-Universe-Org-h3781038-b4c5-449f-98b0-2e02abb7aae0",
  name: "Universe Org",
  facilities: [],
};

const mockNavigate = jest.fn();
const mockLocation = jest.fn();

jest.mock("react-router-dom", () => {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  };
});
let mocks: MockedProviderProps["mocks"];
describe("Unarchive patient container", () => {
  const mockStore = createMockStore([]);
  const mockedStore = mockStore({ facilities: [] });
  it("displays search and instructions", async () => {
    mocks = [
      {
        request: {
          query: GetOrganizationsDocument,
          variables: {
            identityVerified: true,
          },
        },
        result: {
          data: {
            organizations: [mockOrg2, mockOrg1],
          },
        },
      },
      {
        request: {
          query: GetOrganizationWithFacilitiesDocument,
          variables: {
            id: mockOrg2.internalId,
          },
        },
        result: {
          data: {
            organization: mockOrg2,
          },
        },
      },
    ];

    render(
      <Provider store={mockedStore}>
        <MockedProvider mocks={mocks} addTypename={false}>
          <UnarchivePatientContainer />
        </MockedProvider>
      </Provider>
    );
    await waitForElementToBeRemoved(() =>
      screen.queryByText("Loading Organizations …")
    );
    expect(screen.getByText("Unarchive patient")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Filter by organization and testing facility to display archived patients."
      )
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Organization *")).toBeInTheDocument();
    expect(screen.getByLabelText("Testing facility *")).toBeInTheDocument();
    expect(screen.getByText("Search")).toBeEnabled();

    // selecting an org with no facilities
    await selectDropdown("Organization *", mockOrg2.name);
    expect(
      screen.getByText(
        "This organization has no facilities. Select a different organization."
      )
    ).toBeInTheDocument();
  });
  it("shows an error", async () => {
    let alertSpy = jest.spyOn(srToast, "showError");
    mocks = [
      {
        request: {
          query: GetOrganizationsDocument,
          variables: {
            identityVerified: true,
          },
        },
        result: {
          errors: [
            new GraphQLError(
              "A wild error appeared",
              null,
              null,
              null,
              null,
              null,
              { code: "ERROR_CODE" }
            ),
          ],
        },
      },
    ];
    render(
      <Provider store={mockedStore}>
        <MockedProvider mocks={mocks} addTypename={false}>
          <UnarchivePatientContainer />
        </MockedProvider>
      </Provider>
    );
    await waitForElementToBeRemoved(() =>
      screen.queryByText("Loading Organizations …")
    );
    expect(alertSpy).toHaveBeenCalledWith(
      "A wild error appeared",
      "Something went wrong"
    );
  });
});
export const selectDropdown = async (label: string, value: string) => {
  await act(
    async () =>
      await userEvent.selectOptions(screen.getByLabelText(label), value)
  );
};

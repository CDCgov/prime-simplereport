import React from "react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import {
  act,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import configureStore from "redux-mock-store";
import { AnyAction, Store } from "redux";
import userEvent from "@testing-library/user-event";
import { cloneDeep } from "lodash";

import {
  GetUserDocument,
  GetUsersAndStatusDocument,
} from "../../../generated/graphql";
import {
  ORG_ADMIN_REACTIVATE_COPY,
  SITE_ADMIN_REACTIVATE_COPY,
} from "../../commonComponents/UserDetails/ReactivateUserModal";

import ManageUsersContainer from "./ManageUsersContainer";

describe("ManageUsersContainer", () => {
  const mockStore = configureStore([]);
  const storeData = {
    organization: {
      name: "Organization Name",
    },
    user: {
      firstName: "Kim",
      lastName: "Mendoza",
      roleDescription: "Admin user",
      isAdmin: false,
    },
    facilities: [
      { id: "1", name: "Facility 1" },
      { id: "2", name: "Facility 2" },
    ],
  };
  const mockedUsersWithStatus = [
    {
      id: "3a4a221d-a8ca-42b3-aa03-37b93266025b",
      firstName: "Ben",
      middleName: "Billy",
      lastName: "Barnes",
      email: "ben@example.com",
      status: "ACTIVE",
      __typename: "ApiUserWithStatus",
    },
    {
      id: "1029653e-24d9-428e-83b0-468319948902",
      firstName: "Bob",
      middleName: null,
      lastName: "Bobberoo",
      email: "bob@example.com",
      status: "ACTIVE",
      __typename: "ApiUserWithStatus",
    },
    {
      id: "60bb9e3a-fe8a-4b81-b894-b01649c95e70",
      firstName: "Jamar",
      middleName: "Donald",
      lastName: "Jackson",
      email: "jamar@example.com",
      status: "ACTIVE",
      __typename: "ApiUserWithStatus",
    },
    {
      id: "0d3fa224-3d56-4382-b89c-9d8e415e59b3",
      firstName: "Ruby",
      middleName: "Raven",
      lastName: "Reynolds",
      email: "ruby@example.com",
      status: "ACTIVE",
      __typename: "ApiUserWithStatus",
    },
    {
      id: "17656bad-07b6-4fd4-bb9a-ccbc54e5ea0a",
      firstName: "Sarah",
      middleName: "Sally",
      lastName: "Samuels",
      email: "sarah@example.com",
      status: "ACTIVE",
      __typename: "ApiUserWithStatus",
    },
    {
      id: "17656bad-08b6-4fd4-bb9a-ccac54e5ea0a",
      firstName: "Nicole",
      middleName: "Suspended",
      lastName: "Carter",
      email: "nicole@example.com",
      status: "SUSPENDED",
      __typename: "ApiUserWithStatus",
    },
  ];
  const store = mockStore(storeData);
  const mocks: MockedResponse[] = [
    {
      request: {
        operationName: "GetUsersAndStatus",
        query: GetUsersAndStatusDocument,
        variables: {},
      },
      result: {
        data: {
          usersWithStatus: mockedUsersWithStatus,
        },
      },
    },
    {
      request: {
        operationName: "GetUser",
        query: GetUserDocument,
        variables: { id: "3a4a221d-a8ca-42b3-aa03-37b93266025b" },
      },
      result: {
        data: {
          user: {
            id: "3a4a221d-a8ca-42b3-aa03-37b93266025b",
            firstName: "Ben",
            middleName: "Billy",
            lastName: "Barnes",
            roleDescription: "Misconfigured user",
            role: null,
            permissions: [],
            email: "ben@example.com",
            status: "ACTIVE",
            organization: {
              testingFacility: [
                {
                  id: "3ea40184-b7d6-4807-b924-747a316a86a6",
                  name: "Testing Site",
                  __typename: "Facility",
                },
              ],
              __typename: "Organization",
            },
            __typename: "User",
          },
        },
      },
    },
  ];

  const supendedUserMocks: MockedResponse[] = [
    {
      request: {
        operationName: "GetUsersAndStatus",
        query: GetUsersAndStatusDocument,
        variables: {},
      },
      result: {
        data: {
          usersWithStatus: mockedUsersWithStatus,
        },
      },
    },
    {
      request: {
        operationName: "GetUser",
        query: GetUserDocument,
        variables: { id: "3a4a221d-a8ca-42b3-aa03-37b93266025b" },
      },
      result: {
        data: {
          user: {
            id: "3a4a221d-a8ca-42b3-aa03-37b93266025b",
            firstName: "Ben",
            middleName: "Billy",
            lastName: "Barnes",
            roleDescription: "Misconfigured user",
            role: null,
            permissions: [],
            email: "ben@example.com",
            status: "ACTIVE",
            organization: {
              testingFacility: [
                {
                  id: "3ea40184-b7d6-4807-b924-747a316a86a6",
                  name: "Testing Site",
                  __typename: "Facility",
                },
              ],
              __typename: "Organization",
            },
            __typename: "User",
          },
        },
      },
    },
    {
      request: {
        operationName: "GetUser",
        query: GetUserDocument,
        variables: { id: "17656bad-08b6-4fd4-bb9a-ccac54e5ea0a" },
      },
      result: {
        data: {
          user: {
            id: "17656bad-08b6-4fd4-bb9a-ccac54e5ea0a",
            firstName: "Nicole",
            middleName: "Suspended",
            lastName: "Carter",
            roleDescription: "Standard user",
            role: "Standard user",
            permissions: [],
            email: "nicole@example.com",
            status: "SUSPENDED",
            organization: {
              testingFacility: [
                {
                  id: "3ea40184-b7d6-4807-b924-747a316a86a6",
                  name: "Testing Site",
                  __typename: "Facility",
                },
              ],
              __typename: "Organization",
            },
            __typename: "User",
          },
        },
      },
    },
  ];
  const renderComponentWithMocks = (
    graphqlResponses: MockedResponse[],
    store: Store<unknown, AnyAction>
  ) =>
    render(
      <MemoryRouter>
        <MockedProvider mocks={graphqlResponses}>
          <Provider store={store}>
            <ManageUsersContainer />
          </Provider>
        </MockedProvider>
      </MemoryRouter>
    );

  it("loads the component and displays users successfully", async () => {
    const { container } = renderComponentWithMocks(mocks, store);
    await waitForElementToBeRemoved(screen.queryByText("Loading..."));
    await waitFor(() =>
      expect(
        screen.queryByRole("heading", {
          level: 2,
          description: /barnes, ben billy/i,
        })
      )
    );
    await screen.findByText(/ben@example.com/i);
    expect(container).toMatchSnapshot();
    expect(document.title).toEqual("Manage users | SimpleReport");
  });

  it("loads the component and user not found ", async () => {
    const notFoundMock = [{ ...mocks[0], result: {} }];
    renderComponentWithMocks(notFoundMock, store);
    await screen.findByText(/Error: Users not found/i);
  });

  it("when user is an org admin , modal copy reflects the reactivate only flow", async () => {
    renderComponentWithMocks(supendedUserMocks, store);

    const suspendedUser = await screen.findByText("Carter, Nicole Suspended");
    await act(async () => await userEvent.click(suspendedUser));

    const reactivateButton = await screen.findByText("Activate user");
    await act(async () => await userEvent.click(reactivateButton));
    expect(await screen.findByText(ORG_ADMIN_REACTIVATE_COPY));
  });

  it("when user is a site admin , modal copy reflects the reset password flow", async () => {
    const storeWithSiteAdminUser = cloneDeep(storeData);
    storeWithSiteAdminUser.user.isAdmin = true;
    const testMockStore = mockStore(storeWithSiteAdminUser);

    renderComponentWithMocks(supendedUserMocks, testMockStore);

    const suspendedUser = await screen.findByText("Carter, Nicole Suspended");
    await act(async () => await userEvent.click(suspendedUser));

    const reactivateButton = await screen.findByText("Activate user");
    await act(async () => await userEvent.click(reactivateButton));
    expect(await screen.findByText(SITE_ADMIN_REACTIVATE_COPY));
  });
});

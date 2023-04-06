import React from "react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import configureStore from "redux-mock-store";
import { AnyAction, Store } from "redux";

import {
  GetUserDocument,
  GetUsersAndStatusDocument,
} from "../../../generated/graphql";

import ManageUsersContainer from "./ManageUsersContainer";

describe("ManageUsersContainer", () => {
  const mockStore = configureStore([]);
  const store = mockStore({
    organization: {
      name: "Organization Name",
    },
    user: {
      firstName: "Kim",
      lastName: "Mendoza",
    },
    facilities: [
      { id: "1", name: "Facility 1" },
      { id: "2", name: "Facility 2" },
    ],
  });
  const mocks: MockedResponse[] = [
    {
      request: {
        operationName: "GetUsersAndStatus",
        query: GetUsersAndStatusDocument,
        variables: {},
      },
      result: {
        data: {
          usersWithStatus: [
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
          ],
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
    await screen.findByText(/barnes, ben billy/i);
    await screen.findByText(/ben@example.com/i);
    expect(container).toMatchSnapshot();
    expect(document.title).toEqual("Manage users | SimpleReport");
  });

  it("loads the component and user not found ", async () => {
    const notFoundMock = [{ ...mocks[0], result: {} }];
    renderComponentWithMocks(notFoundMock, store);
    await screen.findByText(/Error: Users not found/i);
  });
});

import { Meta } from "@storybook/react";
import configureStore from "redux-mock-store";
import React from "react";
import {
  reactRouterParameters,
  withRouter,
} from "storybook-addon-react-router-v6";
import { Provider } from "react-redux";
import { MockedProvider } from "@apollo/client/testing";

import AddPatient from "./AddPatient";

const mockFacilityID = "b0d2041f-93c9-4192-b19a-dd99c0044a7e";
const mockStore = configureStore([]);
const store = mockStore({
  facilities: [{ id: mockFacilityID, name: "123" }],
  organization: { name: "Test Organization" },
});

const element = (
  <Provider store={store}>
    <MockedProvider mocks={[]} addTypename={false}>
      <AddPatient />
    </MockedProvider>
  </Provider>
);
export default {
  title: "Add Patient",
  render: () => element,
  decorators: [withRouter],
} as Meta;
export const Default = {
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        searchParams: { facility: mockFacilityID },
      },
      routing: {
        path: `/add-patient?facility=${mockFacilityID}`,
      },
    }),
  },
};

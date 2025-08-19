import { Meta } from "@storybook/react-webpack5";
import configureStore from "redux-mock-store";
import React from "react";
import { Provider } from "react-redux";
import {
  createMemoryRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

import { getMocks, StoryGraphQLProvider } from "../../stories/storyMocks";

import AddPatient from "./AddPatient";

const mockFacilityID = "b0d2041f-93c9-4192-b19a-dd99c0044a7e";
const mockStore = configureStore([]);
const store = mockStore({
  facilities: [{ id: mockFacilityID, name: "123" }],
  organization: { name: "Test Organization" },
});

const element = (
  <Provider store={store}>
    <AddPatient />
  </Provider>
);

export default {
  title: "App/Patients/Add Patient",
  parameters: {
    msw: getMocks("AddPatient", "PatientExists"),
  },
  decorators: [
    (Story) => (
      <StoryGraphQLProvider>
        <Story />
      </StoryGraphQLProvider>
    ),
  ],
} as Meta;

const route = createRoutesFromElements(
  <>
    <Route element={element} path={"/add-patient"} />
    {/* defining these extra routes to the same element so that clicking links
     within the component doesn't cause 404's */}
    <Route element={element} path={"/upload-patients"} />
    <Route element={element} path={"/patients"} />
    <Route element={element} path={"/queue"} />
  </>
);
const router = createMemoryRouter(route, {
  initialEntries: [`/add-patient?facility=${mockFacilityID}`],
});
const Template = (): React.ReactElement => {
  return <RouterProvider router={router} />;
};

export const Default = Template.bind({});

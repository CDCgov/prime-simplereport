import { StoryFn, Meta } from "@storybook/react";
import { Provider } from "react-redux";
import { MockedProvider } from "@apollo/client/testing";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";

import AddPatient from "./AddPatient";

const mockFacilityID = "b0d2041f-93c9-4192-b19a-dd99c0044a7e";
const mockStore = configureStore([]);
const store = mockStore({
  facilities: [{ id: mockFacilityID, name: "123" }],
  organization: { name: "Test Organization" },
});

export default {
  title: "Add Patient",
  component: AddPatient,
  argTypes: {},
} as Meta;

const Template: StoryFn = (_args) => (
  <MemoryRouter initialEntries={[`/add-patient?facility=${mockFacilityID}`]}>
    <Provider store={store}>
      <MockedProvider mocks={[]} addTypename={false}>
        <AddPatient />
      </MockedProvider>
    </Provider>
  </MemoryRouter>
);

export const Default = Template.bind({});
Default.args = {};

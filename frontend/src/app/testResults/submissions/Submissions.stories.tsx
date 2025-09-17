import { Meta, StoryFn } from "@storybook/react-webpack5";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import createMockStore from "redux-mock-store";

import { getMocks, StoryGraphQLProvider } from "../../../stories/storyMocks";

import Submissions from "./Submissions";

type Props = {};

const mockStore = createMockStore([]);
const store = mockStore({
  organization: {
    name: "Central Schools",
  },
  facilities: [{ id: "1", name: "Lincoln Middle School" }],
});

export default {
  title: "App/Results/Upload history",
  component: Submissions,
  argTypes: {},
  args: {},
  decorators: [
    (Story) => (
      <StoryGraphQLProvider>
        <Story />
      </StoryGraphQLProvider>
    ),
  ],
} as Meta;

const Template: StoryFn<Props> = (args) => (
  <Provider store={store}>
    <MemoryRouter>
      <Submissions {...args} />
    </MemoryRouter>
  </Provider>
);

export const WithResults = Template.bind({});
WithResults.parameters = {
  msw: getMocks("GetUploadSubmissions"),
};
WithResults.args = {};

export const NoResults = Template.bind({});
NoResults.parameters = {
  msw: getMocks("GetEmptyUploadSubmissions"),
};
NoResults.args = {};

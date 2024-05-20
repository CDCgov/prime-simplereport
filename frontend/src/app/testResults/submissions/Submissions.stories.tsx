import { Meta, StoryFn } from "@storybook/react";
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

const Template: StoryFn<Props> = (args) => (
  <Provider store={store}>
    <MemoryRouter>
      <Submissions {...args} />
    </MemoryRouter>
  </Provider>
);

export default {
  title: "App/Test results/Submissions",
  component: Template,
  argTypes: {},
  args: {},
  parameters: {
    msw: getMocks("GetUploadSubmissions", "EditQueueItem"),
  },
  decorators: [
    (Story) => (
      <StoryGraphQLProvider>
        <Story />
      </StoryGraphQLProvider>
    ),
  ],
} as Meta;

export const Primary = {};

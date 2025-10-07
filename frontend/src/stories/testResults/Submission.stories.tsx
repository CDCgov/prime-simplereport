import { Meta, StoryFn } from "@storybook/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import createMockStore from "redux-mock-store";

import { getMocks, StoryGraphQLProvider } from "../../stories/storyMocks";
import Submission from "../../app/testResults/submissions/Submission";

const mockStore = createMockStore([]);
const store = mockStore({
  organization: {
    name: "Central Schools",
  },
  facilities: [{ id: "1", name: "Lincoln Middle School" }],
});

export default {
  title: "Submission",
  component: Submission,
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

const Template: StoryFn = (args) => (
  <Provider store={store}>
    <MemoryRouter>
      <Submission {...args} />
    </MemoryRouter>
  </Provider>
);

export const Default = Template.bind({});
Default.parameters = {
  msw: getMocks("GetUploadSubmission"),
};
Default.args = {};

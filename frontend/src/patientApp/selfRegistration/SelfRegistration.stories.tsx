import { StoryFn, Meta } from "@storybook/react";
import { Provider } from "react-redux";
import { MemoryRouter as Router } from "react-router-dom";
import createMockStore from "redux-mock-store";

import { getMocks } from "../../stories/storyMocks";

import { SelfRegistration } from "./SelfRegistration";

export default {
  title: "App/Self-Registration",
  component: SelfRegistration,
  decorators: [
    (Story) => (
      <Provider store={createMockStore()({})}>
        <Router initialEntries={["/register/shady-oaks"]}>
          <Story />
        </Router>
      </Provider>
    ),
  ],
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {},
} as Meta;

const Template: StoryFn = (args) => <SelfRegistration {...args} />;

export const Default = Template.bind({});
Default.args = {};
Default.parameters = {
  msw: getMocks("getEntityName", "uniqueRegistration", "register"),
};

export const Duplicate = Template.bind({});
Duplicate.args = {};
Duplicate.parameters = {
  msw: getMocks("getEntityName", "duplicateRegistration"),
};

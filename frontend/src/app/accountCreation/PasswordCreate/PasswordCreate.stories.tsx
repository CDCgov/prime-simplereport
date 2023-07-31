import { StoryFn, Meta } from "@storybook/react";
import { Provider } from "react-redux";
import createMockStore from "redux-mock-store";

import { PasswordCreate } from "./PasswordCreate";

const mockStore = createMockStore([]);
export default {
  title: "App/Account set up/Step 1: Set password",
  component: PasswordCreate,
  argTypes: {},
} as Meta;

const store = mockStore({
  activationToken: "foo",
});

const Template: StoryFn = (args) => (
  <Provider store={store}>
    <PasswordCreate {...args} />
  </Provider>
);

export const Default = Template.bind({});
Default.args = {};

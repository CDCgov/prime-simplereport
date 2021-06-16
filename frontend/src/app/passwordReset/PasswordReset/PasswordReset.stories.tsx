import { Story, Meta } from "@storybook/react";
import { Provider } from "react-redux";
import createMockStore from "redux-mock-store";

import { PasswordReset } from "./PasswordReset";

const mockStore = createMockStore([]);
export default {
  title: "App/Password reset/Reset password",
  component: PasswordReset,
  argTypes: {},
} as Meta;

const store = mockStore({
  activationToken: "foo",
});

const Template: Story = (args) => (
  <Provider store={store}>
    <PasswordReset {...args} />
  </Provider>
);

export const Default = Template.bind({});
Default.args = {};

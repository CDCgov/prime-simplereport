import { Story, Meta } from "@storybook/react";
import { Provider } from "react-redux";
import createMockStore from "redux-mock-store";

import { PasswordForm } from "./PasswordForm";

const mockStore = createMockStore([]);
export default {
  title: "App/Account set up/Step 1: Set password",
  component: PasswordForm,
  argTypes: {},
} as Meta;

const store = mockStore({
  activationToken: "foo",
});

const Template: Story = (args) => (
  <Provider store={store}>
    <PasswordForm {...args} />
  </Provider>
);

export const Default = Template.bind({});
Default.args = {};

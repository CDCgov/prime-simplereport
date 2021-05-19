import { Story, Meta } from "@storybook/react";

import { AuthenticationApp } from "./AuthenticationApp";

export default {
  title: "App/Password reset/Authentication app",
  component: AuthenticationApp,
  argTypes: {},
} as Meta;

const Template: Story = (args) => <AuthenticationApp {...args} />;

export const Default = Template.bind({});
Default.args = {};

import { Story, Meta } from "@storybook/react";

import { VerifyAuthenticationApp } from "./VerifyAuthenticationApp";

export default {
  title: "App/Password reset/Verify: Authentication app",
  component: VerifyAuthenticationApp,
  argTypes: {},
} as Meta;

const Template: Story = (args) => <VerifyAuthenticationApp {...args} />;

export const Default = Template.bind({});
Default.args = {};

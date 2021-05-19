import { Story, Meta } from "@storybook/react";

import { MfaAuthenticationApp } from "./MfaAuthenticationApp";

export default {
  title: "App/Login/MFA: Authentication app",
  component: MfaAuthenticationApp,
  argTypes: {},
} as Meta;

const Template: Story = (args) => <MfaAuthenticationApp {...args} />;

export const Default = Template.bind({});
Default.args = {};

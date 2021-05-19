import { Story, Meta } from "@storybook/react";

import { SecurityCode } from "./SecurityCode";

export default {
  title: "App/Login/MFA: Security code",
  component: SecurityCode,
  argTypes: {},
} as Meta;

const Template: Story = (args) => <SecurityCode {...args} />;

export const Default = Template.bind({});
Default.args = {};

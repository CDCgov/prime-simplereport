import { Story, Meta } from "@storybook/react";

import { SecurityCode } from "./SecurityCode";

export default {
  title: "App/Password reset/Authentication app",
  component: SecurityCode,
  argTypes: {},
} as Meta;

const Template: Story = (args) => <SecurityCode {...args} />;

export const Default = Template.bind({});
Default.args = {};

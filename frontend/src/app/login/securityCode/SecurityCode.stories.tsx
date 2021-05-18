import { Story, Meta } from "@storybook/react";

import { SecurityCode } from "./SecurityCode";

export default {
  title: "App/Login/Security code",
  component: SecurityCode,
  argTypes: {},
  args: { phoneNumber: "(530) 867-5309" },
} as Meta;

const Template: Story = (args) => <SecurityCode {...args} />;

export const Default = Template.bind({});
Default.args = {};

import { Story, Meta } from "@storybook/react";

import { AccountLocked } from "./AccountLocked";

export default {
  title: "App/Login/Account locked",
  component: AccountLocked,
  argTypes: {},
} as Meta;

const Template: Story = (args) => <AccountLocked {...args} />;

export const Default = Template.bind({});
Default.args = {};

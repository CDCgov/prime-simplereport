import { Story, Meta } from "@storybook/react";

import { Sms } from "./Sms";

export default {
  title: "App/Account set up/Step 3a: SMS",
  component: Sms,
  argTypes: {},
} as Meta;

const Template: Story = (args) => <Sms {...args} />;

export const Default = Template.bind({});
Default.args = {};

export const ErrorState = Template.bind({});
ErrorState.args = {
  passwordError: "error",
};

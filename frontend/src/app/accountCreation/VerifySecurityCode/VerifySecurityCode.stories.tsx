import { Story, Meta } from "@storybook/react";

import { VerifySecurityCode } from "./VerifySecurityCode";

export default {
  title: "App/Account set up/Step 3b: Verify security code",
  component: VerifySecurityCode,
  argTypes: {},
} as Meta;

const Template: Story = (args) => <VerifySecurityCode {...args} />;

export const Default = Template.bind({});
Default.args = {};

export const ErrorState = Template.bind({});
ErrorState.args = {
  passwordError: "error",
};

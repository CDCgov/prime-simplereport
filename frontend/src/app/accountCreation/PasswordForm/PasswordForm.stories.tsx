import { Story, Meta } from "@storybook/react";

import { PasswordForm } from "./PasswordForm";

export default {
  title: "App/Account set up/Step 1: Password form",
  component: PasswordForm,
  argTypes: {},
} as Meta;

const Template: Story = (args) => <PasswordForm {...args} />;

export const Default = Template.bind({});
Default.args = { passwordStrength: 0 };

export const PwStrengthWeak1 = Template.bind({});
PwStrengthWeak1.args = { passwordStrength: 1 };

export const PwStrengthWeak2 = Template.bind({});
PwStrengthWeak2.args = { passwordStrength: 2 };

export const PwStrengthOkay = Template.bind({});
PwStrengthOkay.args = { passwordStrength: 3 };

export const PwStrengthGood = Template.bind({});
PwStrengthGood.args = { passwordStrength: 4 };

export const ErrorState = Template.bind({});
ErrorState.args = {
  passwordError: "error",
};

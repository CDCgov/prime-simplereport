import { Story, Meta } from "@storybook/react";

import { PasswordForm } from "../app/accountCreation/PasswordForm";

export default {
  title: "App/AccountCreation/PasswordForm",
  component: PasswordForm,
  argTypes: {},
} as Meta;

const Template: Story = (args) => <PasswordForm {...args} />;

export const Default = Template.bind({});
Default.args = {};

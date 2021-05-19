import { Story, Meta } from "@storybook/react";

import { PasswordForm } from "./PasswordForm";

export default {
  title: "App/Account set up/Step 1: Set password",
  component: PasswordForm,
  argTypes: {},
} as Meta;

const Template: Story = (args) => <PasswordForm {...args} />;

export const Default = Template.bind({});
Default.args = {};

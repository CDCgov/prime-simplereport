import { Story, Meta } from "@storybook/react";

import { EmailConfirm } from "./EmailConfirm";

export default {
  title: "App/Password reset/Email confirm",
  component: EmailConfirm,
  argTypes: {},
} as Meta;

const Template: Story = (args) => <EmailConfirm {...args} />;

export const Default = Template.bind({});
Default.args = {};

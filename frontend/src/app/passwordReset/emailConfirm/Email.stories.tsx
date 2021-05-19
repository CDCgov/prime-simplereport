import { Story, Meta } from "@storybook/react";

import { Email } from "./Email";

export default {
  title: "App/Password reset/Email confirm",
  component: Email,
  argTypes: {},
} as Meta;

const Template: Story = (args) => <Email {...args} />;

export const Default = Template.bind({});
Default.args = {};

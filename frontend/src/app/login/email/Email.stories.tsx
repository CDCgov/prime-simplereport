import { Story, Meta } from "@storybook/react";

import { Email } from "./Email";

export default {
  title: "App/Login/Email",
  component: Email,
  argTypes: {},
} as Meta;

const Template: Story = (args) => <Email {...args} />;

export const Default = Template.bind({});
Default.args = {};

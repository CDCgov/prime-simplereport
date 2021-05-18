import { Story, Meta } from "@storybook/react";

import { Complete } from "./Complete";

export default {
  title: "App/Password reset/Complete",
  component: Complete,
  argTypes: {},
} as Meta;

const Template: Story = (args) => <Complete {...args} />;

export const Default = Template.bind({});
Default.args = {};

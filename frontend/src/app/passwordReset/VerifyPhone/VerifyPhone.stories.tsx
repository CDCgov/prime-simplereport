import { Story, Meta } from "@storybook/react";

import { VerifyPhone } from "./VerifyPhone";

export default {
  title: "App/Password reset/Verify: Phone call",
  component: VerifyPhone,
  argTypes: {},
} as Meta;

const Template: Story = (args) => <VerifyPhone {...args} />;

export const Default = Template.bind({});
Default.args = {};

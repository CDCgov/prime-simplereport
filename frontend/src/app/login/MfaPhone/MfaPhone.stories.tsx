import { Story, Meta } from "@storybook/react";

import { MfaPhone } from "./MfaPhone";

export default {
  title: "App/Login/MFA: Phone",
  component: MfaPhone,
  argTypes: {},
} as Meta;

const Template: Story = (args) => <MfaPhone {...args} />;

export const Default = Template.bind({});
Default.args = {};

import { Story, Meta } from "@storybook/react";

import { Sms } from "./Sms";

export default {
  title: "App/Password reset/Text message (SMS)",
  component: Sms,
  argTypes: {},
  args: { phoneNumber: "(530) 867-5309" },
} as Meta;

const Template: Story = (args) => <Sms {...args} />;

export const Default = Template.bind({});
Default.args = {};

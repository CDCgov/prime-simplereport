import { Story, Meta } from "@storybook/react";

import { VerifySms } from "./VerifySms";

export default {
  title: "App/Password reset/Verify: Text message (SMS)",
  component: VerifySms,
  argTypes: {},
  args: { phoneNumber: "(530) 867-5309" },
} as Meta;

const Template: Story = (args) => <VerifySms {...args} />;

export const Default = Template.bind({});
Default.args = {};

import { Story, Meta } from "@storybook/react";

import { MfaSmsVerify } from "./MfaSmsVerify";

export default {
  title: "App/Account set up/Step 3b: Verify SMS security code",
  component: MfaSmsVerify,
  argTypes: {},
} as Meta;

const Template: Story = (args) => <MfaSmsVerify {...args} />;

export const Default = Template.bind({});
Default.args = {};

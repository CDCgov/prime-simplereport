import { Story, Meta } from "@storybook/react";

import { MfaEmailVerify } from "./MfaEmailVerify";

export default {
  title: "App/Account set up/Step 3b: Verify Email security code",
  component: MfaEmailVerify,
  argTypes: {},
} as Meta;

const Template: Story = (args) => <MfaEmailVerify {...args} />;

export const Default = Template.bind({});
Default.args = {};

import { Story, Meta } from "@storybook/react";

import { MfaOktaVerify } from "./MfaOktaVerify";

export default {
  title: "App/Account set up/Step 3b: Verify Okta Verify security code",
  component: MfaOktaVerify,
  argTypes: {},
} as Meta;

const Template: Story = (args) => <MfaOktaVerify {...args} />;

export const Default = Template.bind({});
Default.args = {};

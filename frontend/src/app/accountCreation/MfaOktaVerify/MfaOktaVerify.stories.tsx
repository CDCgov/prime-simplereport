import { Story, Meta } from "@storybook/react";

import { getMocks } from "../../../stories/storyMocks";

import { MfaOktaVerify } from "./MfaOktaVerify";

export default {
  title: "App/Account set up/Step 3a: Okta Verify MFA",
  component: MfaOktaVerify,
  parameters: {
    msw: getMocks("enrollTotpMfa"),
  },
  argTypes: {},
} as Meta;

const Template: Story = (args) => <MfaOktaVerify {...args} />;

export const Default = Template.bind({});
Default.args = {};

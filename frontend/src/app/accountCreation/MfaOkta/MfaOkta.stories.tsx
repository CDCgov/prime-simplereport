import { Story, Meta } from "@storybook/react";

import { getMocks } from "../../../stories/storyMocks";

import { MfaOkta } from "./MfaOkta";

export default {
  title: "App/Account set up/Step 3a: Okta Verify MFA",
  component: MfaOkta,
  parameters: {
    msw: getMocks("enrollTotpMfa"),
  },
  argTypes: {},
} as Meta;

const Template: Story = (args) => <MfaOkta {...args} />;

export const Default = Template.bind({});
Default.args = {};

import { Story, Meta } from "@storybook/react";

import { MfaOktaVerify } from "./MfaOktaVerify";

export default {
  title: "App/Account set up/Step 3a: Okta Verify MFA",
  component: MfaOktaVerify,
  argTypes: {},
} as Meta;

type Props = React.ComponentProps<typeof MfaOktaVerify>;

const Template: Story<Props> = (args) => <MfaOktaVerify {...args} />;

export const Default = Template.bind({});
Default.args = {};

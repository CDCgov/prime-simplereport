import { StoryFn, Meta } from "@storybook/react-webpack5";

import { MfaGoogleAuthVerify } from "./MfaGoogleAuthVerify";

export default {
  title:
    "App/Account set up/Step 3b: Verify Google Authenticator security code",
  component: MfaGoogleAuthVerify,
  argTypes: {},
} as Meta;

const Template: StoryFn = (args) => <MfaGoogleAuthVerify {...args} />;

export const Default = Template.bind({});
Default.args = {};

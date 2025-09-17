import { StoryFn, Meta } from "@storybook/react-webpack5";

import { MfaEmailVerify } from "./MfaEmailVerify";

export default {
  title: "App/Account set up/Step 3b: Verify Email security code",
  component: MfaEmailVerify,
  argTypes: {},
} as Meta;

const Template: StoryFn = (args) => <MfaEmailVerify {...args} />;

export const Default = Template.bind({});
Default.args = {};

import { StoryFn, Meta } from "@storybook/react-webpack5";

import { MfaPhone } from "./MfaPhone";

export default {
  title: "App/Account set up/Step 3a: Voice Call MFA",
  component: MfaPhone,
  argTypes: {},
} as Meta;

const Template: StoryFn = (args) => <MfaPhone {...args} />;

export const Default = Template.bind({});
Default.args = {};

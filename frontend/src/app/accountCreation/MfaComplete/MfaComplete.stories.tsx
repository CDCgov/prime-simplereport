import { StoryFn, Meta } from "@storybook/react";

import { MfaComplete } from "./MfaComplete";

export default {
  title: "App/Account set up/Step 3c: MFA complete",
  component: MfaComplete,
  argTypes: {},
} as Meta;

const Template: StoryFn = (args) => <MfaComplete {...args} />;

export const Default = Template.bind({});
Default.args = {};

import { StoryFn, Meta } from "@storybook/react";

import { MfaSms } from "./MfaSms";

export default {
  title: "App/Account set up/Step 3a: SMS MFA",
  component: MfaSms,
  argTypes: {},
} as Meta;

const Template: StoryFn = (args) => <MfaSms {...args} />;

export const Default = Template.bind({});
Default.args = {};

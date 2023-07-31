import { StoryFn, Meta } from "@storybook/react";

import NextSteps from "./NextSteps";

export default {
  title: "App/Identity Verification/Step 3: Verification Failed",
  component: NextSteps,
  argTypes: {},
} as Meta;

const Template: StoryFn = (args) => <NextSteps {...args} />;

export const Default = Template.bind({});
Default.args = {};

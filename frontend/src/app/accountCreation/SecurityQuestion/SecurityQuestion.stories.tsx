import { StoryFn, Meta } from "@storybook/react";

import { SecurityQuestion } from "./SecurityQuestion";

export default {
  title: "App/Account set up/Step 2: Security question",
  component: SecurityQuestion,
  argTypes: {},
} as Meta;

const Template: StoryFn = (args) => <SecurityQuestion {...args} />;

export const Default = Template.bind({});
Default.args = {};

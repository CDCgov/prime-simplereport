import { StoryFn, Meta } from "@storybook/react";

import RequestAccess from "./RequestAccess";

export default {
  title: "App/Sign up/Step 2a: Request access",
  component: RequestAccess,
  argTypes: {},
} as Meta;

const Template: StoryFn = (args) => <RequestAccess {...args} />;

export const Default = Template.bind({});
Default.args = {};

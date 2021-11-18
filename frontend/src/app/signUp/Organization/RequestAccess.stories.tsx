import { Story, Meta } from "@storybook/react";

import RequestAccess from "./RequestAccess";

export default {
  title: "App/Sign up/Step 2a: Request access",
  component: RequestAccess,
  argTypes: {},
} as Meta;

const Template: Story = (args) => <RequestAccess {...args} />;

export const Default = Template.bind({});
Default.args = {};

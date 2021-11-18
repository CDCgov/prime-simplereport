import { Story, Meta } from "@storybook/react";

import RequestTestResult from "./RequestTestResult";

export default {
  title: "App/Sign up/Step 2c: Request test results",
  component: RequestTestResult,
  argTypes: {},
} as Meta;

const Template: Story = (args) => <RequestTestResult {...args} />;

export const Default = Template.bind({});
Default.args = {};

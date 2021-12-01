import { Story, Meta } from "@storybook/react";

import SignUpGoals from "./SignUpGoals";

export default {
  title: "App/Sign up/Step 1: Sign Up Goals",
  component: SignUpGoals,
  argTypes: {},
} as Meta;

const Template: Story = (args) => <SignUpGoals {...args} />;

export const Default = Template.bind({});
Default.args = {};

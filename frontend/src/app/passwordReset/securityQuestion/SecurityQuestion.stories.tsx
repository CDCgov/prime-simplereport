import { Story, Meta } from "@storybook/react";

import { SecurityAnswer } from "./SecurityQuestion";

export default {
  title: "App/Password reset/Security question",
  component: SecurityAnswer,
  argTypes: {},
} as Meta;

const Template: Story = (args) => <SecurityAnswer {...args} />;

export const Default = Template.bind({});
Default.args = {};

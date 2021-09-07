import { Story, Meta } from "@storybook/react";

import Instructions from "./Instructions";

export default {
  title: "App/Organization sign up/Step 1: Instructions",
  component: Instructions,
  argTypes: {},
} as Meta;

const Template: Story = (args) => <Instructions {...args} />;

export const Default = Template.bind({});
Default.args = {};

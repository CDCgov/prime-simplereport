import { Story, Meta } from "@storybook/react";

import { Phone } from "./Phone";

export default {
  title: "App/Password reset/Phone call",
  component: Phone,
  argTypes: {},
} as Meta;

const Template: Story = (args) => <Phone {...args} />;

export const Default = Template.bind({});
Default.args = {};

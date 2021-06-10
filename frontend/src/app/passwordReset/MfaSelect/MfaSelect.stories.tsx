import { Story, Meta } from "@storybook/react";

import { MfaSelect } from "./MfaSelect";

export default {
  title: "App/Password reset/Select verification",
  component: MfaSelect,
  argTypes: {},
} as Meta;

const Template: Story = (args) => <MfaSelect {...args} />;

export const Default = Template.bind({});
Default.args = {};

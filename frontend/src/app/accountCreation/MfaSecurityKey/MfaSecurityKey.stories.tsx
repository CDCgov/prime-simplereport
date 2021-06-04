import { Story, Meta } from "@storybook/react";

import { MfaSecurityKey } from "./MfaSecurityKey";

export default {
  title: "App/Account set up/Step 3a: Security key",
  component: MfaSecurityKey,
  argTypes: {},
} as Meta;

const Template: Story = (args) => <MfaSecurityKey {...args} />;

export const Default = Template.bind({});
Default.args = {};

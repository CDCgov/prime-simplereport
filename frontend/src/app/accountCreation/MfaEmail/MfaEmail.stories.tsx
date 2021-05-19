import { Story, Meta } from "@storybook/react";

import { MfaEmail } from "./MfaEmail";

export default {
  title: "App/Account set up/Step 3a: Email MFA",
  component: MfaEmail,
  argTypes: {},
} as Meta;

const Template: Story = (args) => <MfaEmail {...args} />;

export const Default = Template.bind({});
Default.args = {};

import { Story, Meta } from "@storybook/react";

import { MfaSelect } from "./MfaSelect";

export default {
  title: "App/Account set up/Step 3: MFA Select",
  component: MfaSelect,
  argTypes: {},
} as Meta;

const Template: Story = (args) => <MfaSelect {...args} />;

export const Default = Template.bind({});
Default.args = {};

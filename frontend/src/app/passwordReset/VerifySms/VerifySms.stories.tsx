import { Story, Meta } from "@storybook/react";

import { VerifySms } from "./VerifySms";

export default {
  title: "App/Password reset/Verify: Text message (SMS)",
  component: VerifySms,
  argTypes: {},
  args: { phoneNumber: "(530) 867-5309" },
} as Meta;

type Props = React.ComponentProps<typeof VerifySms>;

const Template: Story<Props> = (args) => <VerifySms {...args} />;

export const Default = Template.bind({});
Default.args = {};

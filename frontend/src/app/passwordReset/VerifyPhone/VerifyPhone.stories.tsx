import { Story, Meta } from "@storybook/react";

import { VerifyPhone } from "./VerifyPhone";

export default {
  title: "App/Password reset/Verify: Phone call",
  component: VerifyPhone,
  argTypes: {},
  args: { phoneNumber: "(530) 867-5309" },
} as Meta;

type Props = React.ComponentProps<typeof VerifyPhone>;

const Template: Story<Props> = (args) => <VerifyPhone {...args} />;

export const Default = Template.bind({});
Default.args = {};

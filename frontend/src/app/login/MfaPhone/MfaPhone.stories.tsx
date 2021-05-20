import { Story, Meta } from "@storybook/react";

import { MfaPhone } from "./MfaPhone";

export default {
  title: "App/Login/MFA: Phone",
  component: MfaPhone,
  argTypes: {},
  args: { phoneNumber: "(530) 867-5309" },
} as Meta;

type Props = React.ComponentProps<typeof MfaPhone>;

const Template: Story<Props> = (args) => <MfaPhone {...args} />;

export const Default = Template.bind({});
Default.args = {};

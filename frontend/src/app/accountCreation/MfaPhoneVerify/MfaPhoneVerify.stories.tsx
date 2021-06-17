import { Story, Meta } from "@storybook/react";

import { MfaPhoneVerify } from "./MfaPhoneVerify";

export default {
  title: "App/Account set up/Step 3b: Verify Voice Call security code",
  component: MfaPhoneVerify,
  argTypes: {},
  args: {
    location: { state: { contact: "(530) 867-5309" } },
  },
} as Meta;

type Props = React.ComponentProps<typeof MfaPhoneVerify>;

const Template: Story<Props> = (args) => <MfaPhoneVerify {...args} />;

export const Default = Template.bind({});
Default.args = {};

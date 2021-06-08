import { Story, Meta } from "@storybook/react";

import { MfaEmailVerify } from "./MfaEmailVerify";

export default {
  title: "App/Account set up/Step 3b: Verify Email security code",
  component: MfaEmailVerify,
  argTypes: {},
  args: {
    location: { state: { contact: "foo@bar.com" } },
  },
} as Meta;

type Props = React.ComponentProps<typeof MfaEmailVerify>;

const Template: Story<Props> = (args) => <MfaEmailVerify {...args} />;

export const Default = Template.bind({});
Default.args = {};

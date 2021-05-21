import { Story, Meta } from "@storybook/react";

import { MfaSmsVerify } from "./MfaSmsVerify";

export default {
  title: "App/Account set up/Step 3b: Verify SMS security code",
  component: MfaSmsVerify,
  argTypes: {},
  args: { phoneNumber: "(530) 867-5309" },
} as Meta;

type Props = React.ComponentProps<typeof MfaSmsVerify>;

const Template: Story<Props> = (args) => <MfaSmsVerify {...args} />;

export const Default = Template.bind({});
Default.args = {};

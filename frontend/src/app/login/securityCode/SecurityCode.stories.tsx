import { Story, Meta } from "@storybook/react";

import { SecurityCode } from "./SecurityCode";

export default {
  title: "App/Login/Security code",
  component: SecurityCode,
  argTypes: {},
  args: { phoneNumber: "(530) 867-5309" },
} as Meta;

type Props = React.ComponentProps<typeof SecurityCode>;

const Template: Story<Props> = (args) => <SecurityCode {...args} />;

export const Default = Template.bind({});
Default.args = {};

import { Story, Meta } from "@storybook/react";

import Success from "./Success";

export default {
  title: "App/Identity Verification/Step 3: Success",
  component: Success,
  argTypes: {},
  args: {
    email: "admin@foo.com",
  },
} as Meta;

type Props = React.ComponentProps<typeof Success>;

const Template: Story<Props> = (args) => <Success {...args} />;

export const Default = Template.bind({});
Default.args = {};

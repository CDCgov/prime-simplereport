import { StoryFn, Meta } from "@storybook/react-webpack5";

import Success from "./Success";

export default {
  title: "App/Identity Verification/Step 4: Success",
  component: Success,
  argTypes: {},
  args: {
    email: "admin@foo.com",
    activationToken: "1234567890",
  },
} as Meta;

type Props = React.ComponentProps<typeof Success>;

const Template: StoryFn<Props> = (args) => <Success {...args} />;

export const Default = Template.bind({});
Default.args = {};

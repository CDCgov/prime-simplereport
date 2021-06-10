import { Story, Meta } from "@storybook/react";

import { LoadingCard } from "./LoadingCard";

export default {
  title: "App/Account set up/Loading card",
  component: LoadingCard,
  argTypes: {},
  args: {
    message: "Verifying security code...",
  },
} as Meta;

type Props = React.ComponentProps<typeof LoadingCard>;

const Template: Story<Props> = (args) => <LoadingCard {...args} />;

export const Default = Template.bind({});
Default.args = {};

import { StoryFn, Meta } from "@storybook/react";

import { LoadingCard } from "./LoadingCard";

export default {
  title: "Components/Loading card",
  component: LoadingCard,
  argTypes: {},
  args: {
    message: "Verifying security code",
  },
} as Meta;

type Props = React.ComponentProps<typeof LoadingCard>;

const Template: StoryFn<Props> = (args) => <LoadingCard {...args} />;

export const Default = Template.bind({});
Default.args = {};

import { StoryFn, Meta } from "@storybook/react-webpack5";

import Required from "./Required";

export default {
  title: "Components/Form controls/Required",
  component: Required,
} as Meta;

type Props = React.ComponentProps<typeof Required>;

const Template: StoryFn<Props> = (args) => <Required {...args} />;

export const Default = Template.bind({});

export const WithLabel = Template.bind({});
WithLabel.args = { label: "Label" };

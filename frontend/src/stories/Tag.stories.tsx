import { StoryFn, Meta } from "@storybook/react";
import { Tag } from "@trussworks/react-uswds";

export default {
  title: "Components/Tag",
  component: Tag,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {},
  args: {},
} as Meta;

type Props = React.ComponentProps<typeof Tag>;

const Template: StoryFn<Props> = (args) => <Tag {...args} />;

export const Default = Template.bind({});
Default.args = {
  children: "Hello",
};

export const CustomBackground = Template.bind({});
CustomBackground.args = {
  children: "Hello",
  background: "#bba1f7",
};

export const CustomClass = Template.bind({});
CustomClass.args = {
  children: "Hello",
  className: "bg-blue radius-pill",
};

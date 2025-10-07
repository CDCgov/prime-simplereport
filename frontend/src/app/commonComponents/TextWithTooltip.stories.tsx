import { StoryFn, Meta } from "@storybook/react";

import { TextWithTooltip } from "./TextWithTooltip";

export default {
  title: "Components/Text with tooltip",
  component: TextWithTooltip,
  argTypes: {},
  args: {
    text: "tooltip",
    tooltip: "A tooltip contains useful information",
    position: "top",
  },
} as Meta;

type Props = React.ComponentProps<typeof TextWithTooltip>;

const Template: StoryFn<Props> = (args) => (
  <div className="margin-9">
    <p>
      This is a sentence which contains a <TextWithTooltip {...args} />.
    </p>
  </div>
);

export const Default = Template.bind({});
Default.args = {};

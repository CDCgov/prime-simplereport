import { Story, Meta } from "@storybook/react";
import { ComponentProps } from "react";

import SingleFileInput from "./SingleFileInput";

export default {
  title: "Components/Single File Input",
  component: SingleFileInput,
  args: {
    id: "mySingleFileInput",
    name: "mySingleFileInput",
    ariaLabel: "mySingleFileInput",
    onChange: () => alert("change detected"),
  },
} as Meta;

const Template: Story<ComponentProps<typeof SingleFileInput>> = (args) => (
  <SingleFileInput {...args} />
);

export const Default = Template.bind({});

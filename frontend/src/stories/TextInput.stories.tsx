import { StoryFn, Meta } from "@storybook/react";

import { TextInput } from "../app/commonComponents/TextInput";

export default {
  title: "Components/Form controls/Text input",
  component: TextInput,
  argTypes: {},
  args: {
    name: "text-input",
    label: "Text input",
    errorMessage: "Helpful error message",
  },
} as Meta;

type Props = React.ComponentProps<typeof TextInput>;

const Template: StoryFn<Props> = (args) => <TextInput {...args} />;

export const Default = Template.bind({});
Default.args = {};

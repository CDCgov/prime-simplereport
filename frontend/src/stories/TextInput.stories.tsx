import { Story, Meta } from "@storybook/react";

import { TextInput } from "../app/commonComponents/TextInput";

export default {
  title: "Components/Text input",
  component: TextInput,
  argTypes: {},
  args: {
    name: "text-input",
    label: "Text input",
    errorMessage: "Helpful error message",
  },
} as Meta;

type Props = React.ComponentProps<typeof TextInput>;

const Template: Story<Props> = (args) => <TextInput {...args} />;

export const Default = Template.bind({});
Default.args = {};

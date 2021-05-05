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

const Template: Story = (args) => <TextInput {...args} />;

export const Default = Template.bind({});
Default.args = {};

export const WithError = Template.bind({});
WithError.args = {
  validationStatus: "error",
};

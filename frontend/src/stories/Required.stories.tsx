import { Story, Meta } from "@storybook/react";

import Required from "../app/commonComponents/Required";

export default {
  title: "Components/Form controls/Required",
  component: Required,
} as Meta;

type Props = React.ComponentProps<typeof Required>;

const Template: Story<Props> = (args) => <Required {...args} />;

export const Default = Template.bind({});

export const WithLabel = Template.bind({});
WithLabel.args = { label: "Label" };

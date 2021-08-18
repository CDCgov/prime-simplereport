import { Story, Meta } from "@storybook/react";

import PersonalDetailsForm from "./PersonalDetailsForm";

export default {
  title: "App/Identity Verification/Step 2: Personal Details",
  component: PersonalDetailsForm,
  argTypes: {},
  args: {
    orgExternalId: "foo",
  },
} as Meta;

type Props = React.ComponentProps<typeof PersonalDetailsForm>;

const Template: Story<Props> = (args) => <PersonalDetailsForm {...args} />;

export const Default = Template.bind({});
Default.args = {};

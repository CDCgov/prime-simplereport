import { StoryFn, Meta } from "@storybook/react";

import PersonalDetailsForm, {
  PersonalDetailsFormProps,
} from "./PersonalDetailsForm";

export default {
  title: "App/Identity Verification/Step 2: Personal Details",
  component: PersonalDetailsForm,
  argTypes: {},
  args: {
    firstName: "Harry",
    middleName: "James",
    lastName: "Potter",
    orgExternalId: "Hogwarts",
  } as PersonalDetailsFormProps,
} as Meta;

type Props = React.ComponentProps<typeof PersonalDetailsForm>;

const Template: StoryFn<Props> = (args) => <PersonalDetailsForm {...args} />;

export const Default = Template.bind({});
Default.args = {};

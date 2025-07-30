import { StoryFn, Meta } from "@storybook/react-webpack5";

import { getMocks } from "../../../stories/storyMocks";

import QuestionsFormContainer from "./QuestionsFormContainer";
import { initPersonalDetails } from "./utils";

let personalDetails = initPersonalDetails("foo", "Bob", "Bill", "Martínez");
personalDetails.phoneNumber = "5308675309";

export default {
  title: "App/Identity Verification/Step 3: Identity verification questions",
  component: QuestionsFormContainer,
  parameters: {
    msw: getMocks("getQuestions"),
  },
  argTypes: {},
  args: {
    personalDetails,
    orgExternalId: "foo",
    disableTimer: true,
  },
} as Meta;

type Props = React.ComponentProps<typeof QuestionsFormContainer>;

const Template: StoryFn<Props> = (args) => <QuestionsFormContainer {...args} />;

export const Default = Template.bind({});
Default.args = {};

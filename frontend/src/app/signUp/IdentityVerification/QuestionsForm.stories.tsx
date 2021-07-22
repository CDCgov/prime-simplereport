import { Story, Meta } from "@storybook/react";

import { getMocks } from "../../../stories/storyMocks";

import QuestionsFormContainer from "./QuestionsFormContainer";

export default {
  title: "App/Identity Verification/Step 2: Identity verification questions",
  component: QuestionsFormContainer,
  parameters: {
    msw: getMocks("getQuestions"),
  },
  argTypes: {},
  args: {
    personalDetails: {},
  },
} as Meta;

type Props = React.ComponentProps<typeof QuestionsFormContainer>;

const Template: Story<Props> = (args) => <QuestionsFormContainer {...args} />;

export const Default = Template.bind({});
Default.args = {};

import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { Meta, StoryFn } from "@storybook/react";

import { store } from "../../store";
import { StoryGraphQLProvider } from "../../../stories/storyMocks";

import { TestQueueCard } from "./TestQueueCard";

type Props = {};

export default {
  title: "App/Test Queue/Test Queue Card",
  component: TestQueueCard,
  argTypes: {},
  args: {},
  decorators: [
    (Story) => (
      <StoryGraphQLProvider>
        <Story />
      </StoryGraphQLProvider>
    ),
  ],
} as Meta;

const Template: StoryFn<Props> = (args) => (
  <Provider store={store}>
    <MemoryRouter>
      <TestQueueCard {...args} />
    </MemoryRouter>
  </Provider>
);

export const Default = Template.bind({});
Default.args = {};

import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { Meta, StoryFn } from "@storybook/react";

import { store } from "../../app/store";
import { StoryGraphQLProvider } from "../../stories/storyMocks";
import Uploads from "../../app/testResults/uploads/Uploads";

type Props = {};

export default {
  title: "App/Test results/Upload CSV",
  component: Uploads,
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
      <Uploads {...args} />
    </MemoryRouter>
  </Provider>
);

export const Default = Template.bind({});
Default.args = {};

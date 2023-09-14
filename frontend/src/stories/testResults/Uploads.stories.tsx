import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { Meta, StoryFn } from "@storybook/react";

import { store } from "../../app/store";
import { StoryGraphQLProvider } from "../storyMocks";
import UploadForm from "../../app/testResults/uploads/UploadForm";

type Props = {};

export default {
  title: "App/Test results/Upload CSV",
  component: UploadForm,
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
      <UploadForm {...args} />
    </MemoryRouter>
  </Provider>
);

export const Default = Template.bind({});
Default.args = {};

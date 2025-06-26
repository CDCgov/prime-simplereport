import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { Meta, StoryFn } from "@storybook/react";

import { store } from "../../app/store";
import { StoryGraphQLProvider } from "../storyMocks";
import DiseaseSpecificUploadContainer from "../../app/testResults/uploads/DiseaseSpecificUploadContainer";

export default {
  title: "App/Results/Bulk upload form",
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

const DiseaseSpecificTemplate: StoryFn<{}> = () => (
  <Provider store={store}>
    <MemoryRouter>
      <DiseaseSpecificUploadContainer />
    </MemoryRouter>
  </Provider>
);

export const DiseaseSpecificUpload = DiseaseSpecificTemplate.bind({});
DiseaseSpecificUpload.args = {};

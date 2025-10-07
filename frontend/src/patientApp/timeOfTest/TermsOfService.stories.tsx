import { StoryFn, Meta } from "@storybook/react";
import { Provider } from "react-redux";
import createMockStore from "redux-mock-store";

import Page from "../../app/commonComponents/Page/Page";
import PatientHeader from "../PatientHeader";

import TermsOfService from "./TermsOfService";

const mockStore = createMockStore([]);
export default {
  title: "App/Test Results/Step 1: Terms of Service",
  component: TermsOfService,
  argTypes: {},
} as Meta;

const store = mockStore({
  plid: "bc62c320-4ef5-4bff-a840-f3a78cda537c",
});

const Template: StoryFn = (args) => (
  <Provider store={store}>
    <Page>
      <PatientHeader />
      <TermsOfService {...args} />
    </Page>
  </Provider>
);

export const Default = Template.bind({});
Default.args = {};

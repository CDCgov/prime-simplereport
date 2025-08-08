import { StoryFn, Meta } from "@storybook/react-webpack5";
import { Provider } from "react-redux";
import createMockStore from "redux-mock-store";

import Page from "../../app/commonComponents/Page/Page";
import PatientHeader from "../PatientHeader";

import DOB from "./DOB";

const mockStore = createMockStore([]);
export default {
  title: "App/PXP/Step 2: DOB",
  component: DOB,
  argTypes: {},
} as Meta;

const store = mockStore({
  plid: "bc62c320-4ef5-4bff-a840-f3a78cda537c",
  patient: {
    birthDate: "07181992",
  },
});

const Template: StoryFn = (args) => (
  <Provider store={store}>
    <Page>
      <PatientHeader />
      <DOB {...args} />
    </Page>
  </Provider>
);

export const Default = Template.bind({});
Default.args = {};

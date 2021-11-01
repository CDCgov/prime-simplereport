import { Story, Meta } from "@storybook/react";
import { Provider } from "react-redux";
import createMockStore from "redux-mock-store";

import { getMocks, StoryGraphQLProvider } from "../../stories/storyMocks";

import { Analytics } from "./Analytics";

const mockStore = createMockStore([]);
export default {
  title: "App/Analytics/COVID-19 testing data",
  component: Analytics,
  argTypes: {},
  parameters: {
    msw: getMocks("GetTopLevelDashboardMetricsNew"),
  },
  decorators: [
    (Story) => (
      <StoryGraphQLProvider>
        <Story />
      </StoryGraphQLProvider>
    ),
  ],
} as Meta;

const store = mockStore({
  organization: {
    name: "Central Schools",
  },
  facilities: [
    { id: "1", name: "Lincoln Middle School" },
    { id: "2", name: "Rosa Parks High School" },
  ],
});

const Template: Story = (args) => (
  <Provider store={store}>
    <Analytics {...args} />
  </Provider>
);

export const Default = Template.bind({});
Default.args = {};

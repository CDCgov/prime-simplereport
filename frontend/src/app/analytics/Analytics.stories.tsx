import { StoryFn, Meta } from "@storybook/react";
import { Provider } from "react-redux";
import createMockStore from "redux-mock-store";

import { getMocks, StoryGraphQLProvider } from "../../stories/storyMocks";

import { Analytics } from "./Analytics";

const mockStore = createMockStore([]);
export default {
  title: "App/Dashboard/COVID-19 testing data",
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
  args: {
    startDate: "2021-10-15",
    endDate: "2021-10-22",
  },
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

type Props = React.ComponentProps<typeof Analytics>;

const Template: StoryFn<Props> = (args) => (
  <Provider store={store}>
    <Analytics {...args} />
  </Provider>
);

export const Default = Template.bind({});
Default.args = {};

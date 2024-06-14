import { Meta, StoryFn } from "@storybook/react";
import { Provider } from "react-redux";
import createMockStore from "redux-mock-store";

import FacilitySelect, { FacilitySelectProps } from "./FacilitySelect";

export default {
  title: "App/Facility select",
  component: FacilitySelect,
  argTypes: { setActiveFacility: { action: "clicked" } },
} as Meta;

const mockStore = createMockStore([]);

const store = mockStore({
  organization: {
    name: "Foo Organization",
  },
  user: {
    firstName: "Kim",
    lastName: "Mendoza",
  },
  facilities: [
    { id: "1", name: "Facility 1" },
    { id: "2", name: "Facility 2" },
  ],
});

const Template = (): StoryFn<FacilitySelectProps> => (args) =>
  (
    <Provider store={store}>
      <FacilitySelect {...args} />
    </Provider>
  );

const createTestFacility = (name: string, id: string): Facility => ({
  id,
  cliaNumber: "",
  city: "",
  deviceTypes: [],
  email: "",
  name,
  zipCode: "",
  streetTwo: "",
  phone: "",
  orderingProvider: {
    NPI: "",
    city: "",
    firstName: "",
    lastName: "",
    middleName: "",
    phone: "",
    state: "",
    street: "",
    streetTwo: "",
    suffix: "",
    zipCode: "",
  },
  street: "",
  state: "",
});

export const NoFacilities = Template();
NoFacilities.args = {
  facilities: [],
};

export const MultipleFacilities = Template();
MultipleFacilities.args = {
  facilities: [
    createTestFacility("MSU Lab", "abc"),
    createTestFacility("West Lake", "def"),
  ],
};

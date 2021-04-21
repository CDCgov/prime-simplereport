import { Story, Meta } from "@storybook/react";
import { Provider } from "react-redux";

import FacilitySelect, {
  FacilitySelectProps,
} from "../app/facilitySelect/FacilitySelect";
import { store } from "../app/store";

export default {
  title: "App/FacilitySelect",
  component: FacilitySelect,
  argTypes: { setActiveFacility: { action: "clicked" } },
} as Meta;

const Template = (): Story<FacilitySelectProps> => (args) => (
  <Provider store={store}>
    <FacilitySelect {...args} />
  </Provider>
);

const createTestFacility = (name: string, id: string): Facility => ({
  id,
  cliaNumber: "",
  city: "",
  defaultDevice: "",
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

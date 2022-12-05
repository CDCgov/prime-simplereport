import React from "react";
import { MemoryRouter } from "react-router-dom";
import { Story, Meta } from "@storybook/react";

import OrderingProviderList, {
  OrderingProviderListProps,
} from "../app/Settings/Facility/Components/OrderingProviderList";

export default {
  title: "Ordering Provider List",
  component: OrderingProviderList,
} as Meta;

const RouterWithFacility: React.FC = ({ children }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

const Template = (): Story<OrderingProviderListProps> => (args) =>
  (
    <RouterWithFacility>
      <OrderingProviderList {...args} />
    </RouterWithFacility>
  );

const providerOne = {
  firstName: "LeBron",
  middleName: "Optimus",
  lastName: "James",
  suffix: "Sr",
  NPI: "0000000000",
  phone: "6318675309",
  city: "Los Angeles",
  state: "CA",
  street: "100 Fake St",
  streetTwo: "Apt 2",
  zipCode: "10001",
};

const providerTwo = {
  firstName: "Anthony",
  middleName: "Joe",
  lastName: "Davis",
  suffix: "JR",
  NPI: "0000000001",
  phone: "2708675309",
  city: "Los Angeles",
  state: "CA",
  street: "101 Fake St",
  streetTwo: "Apt 3",
  zipCode: "10001",
};

export const NoProviders = Template();
NoProviders.args = {
  providers: [],
  defaultProvider: null,
  updateDefaultProvider: () => {},
  updateProviders: () => {},
};

export const SingleProvider = Template();
SingleProvider.args = {
  providers: [providerOne],
  defaultProvider: providerOne,
  updateDefaultProvider: () => {},
  updateProviders: () => {},
};

export const MultipleProviders = Template();
MultipleProviders.args = {
  providers: [providerOne, providerTwo],
  defaultProvider: providerOne,
  updateDefaultProvider: () => {},
  updateProviders: () => {},
};

import React from "react";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import OrderingProviderList from "./OrderingProviderList";

const RouterWithFacility: React.FC = ({ children }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

const defaultProvider = {
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

const otherProvider = {
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

describe("OrderingProviderList", () => {
  describe("with no devices set for facility", () => {
    beforeEach(() => {
      render(
        <RouterWithFacility>
          <OrderingProviderList
            providers={[]}
            defaultProvider={null}
            updateDefaultProvider={jest.fn()}
            updateProviders={jest.fn()}
          />
        </RouterWithFacility>
      );
    });

    it("renders a message if no ordering devices are present in list", async () => {
      const expected = await screen.findByText("No ordering providers found");

      expect(expected).toBeInTheDocument();
    });
  });

  describe("with devices set for facility", () => {
    beforeEach(() => {
      render(
        <RouterWithFacility>
          <OrderingProviderList
            providers={[defaultProvider, otherProvider]}
            defaultProvider={defaultProvider}
            updateDefaultProvider={jest.fn()}
            updateProviders={jest.fn()}
          />
        </RouterWithFacility>
      );
    });

    it("renders a list of ordering providers", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_header, ...rows] = screen.getAllByRole("row");

      expect(rows.length).toBe(2);

      within(rows[0]).getByText("LeBron James");
      within(rows[0]).getByText("6318675309");

      within(rows[1]).getByText("Anthony Davis");
      within(rows[1]).getByText("2708675309");
    });

    it("correctly indicates the device selected as the default", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_header, ...rows] = screen.getAllByRole("row");

      // The first row represents the default provider from props
      expect(within(rows[0]).getByRole("checkbox")).toBeChecked();

      expect(within(rows[1]).getByRole("checkbox")).not.toBeChecked();
    });
  });
});

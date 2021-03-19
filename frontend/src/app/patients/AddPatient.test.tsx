import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import AddPatient from "./AddPatient";

const mockStore = configureStore([]);

jest.mock("react-router-dom", () => ({
  Prompt: (props: any) => <></>,
  Link: (props: any) => <></>,
  useHistory: () => ({
    listen: jest.fn(),
    push: jest.fn(),
  }),
}));

describe("AddPatient", () => {
  afterEach(cleanup);
  describe("No facility selected", () => {
    beforeEach(() => {
      const store = mockStore({
        facility: {
          id: "",
        },
      });
      render(
        <Provider store={store}>
          <MockedProvider mocks={[]} addTypename={false}>
            <AddPatient />
          </MockedProvider>
        </Provider>
      );
    });
    it("does not show the form title", () => {
      expect(
        screen.queryByText("Add New Person", {
          exact: false,
        })
      ).toBeNull();
    });
    it("shows a 'No facility selected' message", async () => {
      expect(
        await screen.getByText("No facility selected", {
          exact: false,
        })
      ).toBeInTheDocument();
    });
  });

  describe("Facility selected", () => {
    const mockFacilityID = "b0d2041f-93c9-4192-b19a-dd99c0044a7e";
    beforeEach(() => {
      const store = mockStore({
        facility: {
          id: mockFacilityID,
        },
        facilities: [{ id: mockFacilityID, name: "123" }],
      });
      render(
        <Provider store={store}>
          <MockedProvider mocks={[]} addTypename={false}>
            <AddPatient />
          </MockedProvider>
        </Provider>
      );
    });
    it("shows the form title", async () => {
      expect(
        await screen.queryAllByText("Add New Person", { exact: false })[0]
      ).toBeInTheDocument();
    });

    describe("facility select input", () => {
      let facilityInput: HTMLSelectElement;
      beforeEach(() => {
        facilityInput = screen.getByLabelText("Facility", {
          exact: false,
        }) as HTMLSelectElement;
      });
      it("is present in the form", () => {
        expect(facilityInput).toBeInTheDocument();
      });
      it("defaults to no selection", () => {
        expect(facilityInput.value).toBe("");
      });
      it("updates its selection on change", async () => {
        fireEvent.change(facilityInput, {
          target: { value: mockFacilityID },
        });
        expect(facilityInput.value).toBe(mockFacilityID);
      });
    });
  });
});

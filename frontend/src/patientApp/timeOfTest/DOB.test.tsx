import renderer from "react-test-renderer";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import "../../i18n";

import { act } from "react-dom/test-utils";

import DOB from "./DOB";

const mockStore = configureStore([]);
const mockContainer = (store: any) => (
  <Provider store={store}>
    <DOB />
  </Provider>
);

jest.mock("../PxpApiService", () => ({
  PxpApi: {
    validateDateOfBirth: (patientLinkId: string, dateOfBirth: string) => {
      return new Promise((res, rej) => {
        if (dateOfBirth === "1987-08-21") {
          res({ organizationName: "Foo" });
        } else {
          rej();
        }
      });
    },
  },
}));

describe("DOB", () => {
  describe("snapshot", () => {
    let component: renderer.ReactTestRenderer;
    beforeEach(() => {
      const store = mockStore({
        plid: "foo",
      });
      component = renderer.create(mockContainer(store));
    });
    it("matches", () => {
      expect(component.toJSON()).toMatchSnapshot();
    });
  });

  describe("behavior", () => {
    beforeEach(() => {
      const store = mockStore({
        plid: "foo",
      });
      render(mockContainer(store));
    });

    it("Checks for the correct format - dashes aren't accepted", async () => {
      userEvent.type(
        await screen.findByLabelText("Date of birth"),
        "07-12-1987"
      );
      userEvent.click(await screen.findByText("Continue"));
      const error = await screen.findByRole("alert");

      expect(error.textContent).toEqual(
        "Error: The birth date provided is in an incorrect format"
      );
    });

    it("Checks for the correct format - missing slashes aren't accepted", async () => {
      userEvent.type(await screen.findByLabelText("Date of birth"), "07121987");
      userEvent.click(await screen.findByText("Continue"));
      const error = await screen.findByRole("alert");

      expect(error.textContent).toEqual(
        "Error: The birth date provided is in an incorrect format"
      );
    });

    it("Checks to make sure it is actually a possible date", async () => {
      userEvent.type(
        await screen.findByLabelText("Date of birth"),
        "99/99/9999"
      );
      userEvent.click(await screen.findByText("Continue"));
      const error = await screen.findByRole("alert");

      expect(error.textContent).toEqual(
        "Error: The birth date provided is not a possible date"
      );
    });

    it("Checks to make sure it is a date after 1900", async () => {
      userEvent.type(
        await screen.findByLabelText("Date of birth"),
        "08/21/1899"
      );
      userEvent.click(await screen.findByText("Continue"));
      const error = await screen.findByRole("alert");

      expect(error.textContent).toEqual(
        "Error: Birth date must be after 1900 and before the current year"
      );
    });

    it("Checks to make sure it is a date before this year", async () => {
      userEvent.type(
        await screen.findByLabelText("Date of birth"),
        "08/21/2237"
      );
      userEvent.click(await screen.findByText("Continue"));
      const error = await screen.findByRole("alert");

      expect(error.textContent).toEqual(
        "Error: Birth date must be after 1900 and before the current year"
      );
    });

    it("Accepts an otherwise valid date", async () => {
      userEvent.type(
        await screen.findByLabelText("Date of birth"),
        "08/21/1987"
      );
      await act(async () => {
        userEvent.click(await screen.findByText("Continue"));
      });
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });
});

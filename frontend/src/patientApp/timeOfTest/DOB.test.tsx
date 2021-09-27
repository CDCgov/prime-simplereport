import renderer from "react-test-renderer";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import "../../i18n";

import DOB from "./DOB";

const mockStore = configureStore([]);
const mockContainer = (store: any) => (
  <Provider store={store}>
    <DOB />
  </Provider>
);

jest.mock("../PxpApiService", () => {
  jest.fn();
});

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

    it("validates birthdays", async () => {
      userEvent.type(
        await screen.findByLabelText("Date of birth"),
        "99-99-9999"
      );
      userEvent.click(await screen.findByRole("button"));
      const error = await screen.findByRole("alert");

      expect(error.textContent).toEqual("Error: Enter your date of birth");
    });
  });
});

import renderer from "react-test-renderer";
import { render, fireEvent, RenderResult } from "@testing-library/react";
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
    let utils: RenderResult;

    async function setup(utils: RenderResult) {
      const input = await utils.findByLabelText("Date of birth");
      const button = await utils.findByRole("button");
      return { input, button };
    }

    beforeEach(() => {
      const store = mockStore({
        plid: "foo",
      });
      utils = render(mockContainer(store));
    });

    it("validates birthdays", async () => {
      // GIVEN
      const { input, button } = await setup(utils);

      // WHEN
      fireEvent.change(input, { target: { value: "99-99-9999" } });
      fireEvent.submit(button);
      const error = await utils.findByRole("alert");

      // THEN
      expect(error.textContent).toEqual("Error: Enter your date of birth");
    });
  });
});

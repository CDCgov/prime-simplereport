import { render, screen, cleanup } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import PatientFormContainer from "./PatientFormContainer";
import "../../i18n";

jest.mock("@trussworks/react-uswds", () => ({
  ComboBox: () => <></>,
}));
const mockStore = configureStore([]);

jest.mock("react-router-dom", () => ({
  Prompt: (props: any) => <></>,
  useHistory: () => ({
    listen: jest.fn(),
    push: jest.fn(),
  }),
}));

describe("PatientFormContainer", () => {
  afterEach(cleanup);

  it("renders", () => {
    jest
      .useFakeTimers("modern")
      .setSystemTime(new Date("2021-08-01").getTime());
    const store = mockStore({
      patient: {
        residentCongregateSetting: true,
        employedInHealthcare: true,
        birthDate: "",
      },
      plid: "foo",
      facility: {
        id: "123",
      },
      facilities: [],
    });
    render(
      <Provider store={store}>
        <MockedProvider mocks={[]} addTypename={false}>
          <PatientFormContainer />
        </MockedProvider>
      </Provider>
    );

    expect(
      screen.getAllByText("Profile information", { exact: false })[0]
    ).toBeInTheDocument();
  });
  describe("renders the correct content", () => {
    window.scrollTo = jest.fn();

    beforeEach(() => {
      const store = mockStore({
        patient: {
          residentCongregateSetting: true,
          employedInHealthcare: true,
          birthDate: "",
        },
        plid: "foo",
        facility: {
          id: "123",
        },
        facilities: [],
      });
      render(
        <Provider store={store}>
          <MockedProvider mocks={[]} addTypename={false}>
            <PatientFormContainer />
          </MockedProvider>
        </Provider>
      );
    });
    it("shows required field instruction once", () => {
      expect(
        screen.getByText("Required fields are marked with an asterisk", {
          exact: false,
        })
      ).toBeInTheDocument();
    });
    it("doesn't show a facility input", () => {
      expect(
        screen.queryByLabelText("Facility", {
          exact: false,
        }) as HTMLSelectElement
      ).toBeNull();
    });
  });
});

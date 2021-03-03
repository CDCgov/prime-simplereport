import renderer from "react-test-renderer";
import { MockedProvider } from "@apollo/client/testing";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import AoEPatientFormContainer from "./AoEPatientFormContainer";

jest.mock("react-router-dom", () => ({
  useHistory: () => ({
    listen: jest.fn(),
    push: jest.fn(),
  }),
}));

describe("AoEPatientFormContainer", () => {
  beforeAll(() => {
    jest
      .useFakeTimers("modern")
      .setSystemTime(new Date("2399-01-01").getTime());
  });
  it("snapshot", () => {
    const mockStore = configureStore([]);
    const store = mockStore({
      patient: {
        residentCongregateSetting: true,
        employedInHealthcare: true,
        birthDate: "",
      },
      plid: "foo",
    });
    const component = renderer.create(
      <Provider store={store}>
        <MockedProvider mocks={[]} addTypename={false}>
          <AoEPatientFormContainer page={""} />
        </MockedProvider>
      </Provider>
    );

    expect(component.toJSON()).toMatchSnapshot();
  });
});

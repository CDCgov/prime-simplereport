import renderer from "react-test-renderer";
import { MockedProvider } from "@apollo/client/testing";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import AoEPatientFormContainer from "./AoEPatientFormContainer";

const mockStore = configureStore([]);
jest.mock("react-router-dom", () => ({
  useHistory: () => ({
    listen: jest.fn(),
  }),
}));

describe("AoEPatientFormContainer", () => {
  it("snapshot", () => {
    const store = mockStore({
      patient: {
        residentCongregateSetting: true,
        employedInHealthcare: true,
        birthDate: "",
      },
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

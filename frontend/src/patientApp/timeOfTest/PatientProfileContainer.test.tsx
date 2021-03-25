import renderer from "react-test-renderer";
import { MockedProvider } from "@apollo/client/testing";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import PatientProfileContainer from "./PatientProfileContainer";

const mockStore = configureStore([]);

jest.mock("react-router-dom", () => ({
  useHistory: () => ({
    listen: jest.fn(),
    push: jest.fn(),
  }),
}));

describe("PatientProfileContainer", () => {
  it("snapshot", () => {
    const store = mockStore({
      patient: {
        residentCongregateSetting: true,
        employedInHealthcare: true,
        birthDate: "",
        street: "8 Pine Ct",
      },
      plid: "definitely not null I promise",
    });
    const component = renderer.create(
      <Provider store={store}>
        <MockedProvider mocks={[]} addTypename={false}>
          <PatientProfileContainer />
        </MockedProvider>
      </Provider>
    );

    expect(component.toJSON()).toMatchSnapshot();
  });
});

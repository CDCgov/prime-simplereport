import renderer from "react-test-renderer";
import { MockedProvider } from "@apollo/client/testing";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import PatientProfileFormContainer from "./PatientProfileFormContainer";

const mockStore = configureStore([]);

jest.mock("react-router-dom", () => ({
  useHistory: () => ({
    listen: jest.fn(),
    push: jest.fn(),
  }),
}));

jest.mock("../../app/patients/PatientForm", () => () => (
  <div>Patient Form Mock</div>
));

// saving this for when I actually need it...

// jest.mock("@microsoft/applicationinsights-react-js", () => ({
//   useAppInsightsContext: () => {},
//   useTrackEvent: jest.fn(),
// }));

describe("PatientProfileFormContainer", () => {
  it("snapshot", () => {
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
    const component = renderer.create(
      <Provider store={store}>
        <MockedProvider mocks={[]} addTypename={false}>
          <PatientProfileFormContainer />
        </MockedProvider>
      </Provider>
    );

    expect(component.toJSON()).toMatchSnapshot();
  });
});

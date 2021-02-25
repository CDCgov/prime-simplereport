import renderer from "react-test-renderer";
import { MockedProvider } from "@apollo/client/testing";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import PatientForm from "./PatientForm";

const mockStore = configureStore([]);

jest.mock("react-router-dom", () => ({
  Prompt: (props: any) => <></>,
  useHistory: () => ({
    listen: jest.fn(),
    push: jest.fn(),
  }),
}));

jest.mock("@microsoft/applicationinsights-react-js", () => ({
  useAppInsightsContext: () => {},
  useTrackEvent: jest.fn(),
}));

describe("PatientForm", () => {
  it("snapshot", () => {
    const store = mockStore({
      patient: {
        internalId: "51c73542-dc64-4ee8-8368-926fcc61b39e",
        residentCongregateSetting: true,
        employedInHealthcare: true,
        birthDate: "1987-01-31",
      },
      plid: "foo",
      facility: {
        id: "123",
      },
      facilities: [],
    });
    const patient = {
      internalId: "51c73542-dc64-4ee8-8368-926fcc61b39e",
      firstName: "Malik",
      lastName: "Massey",
      middleName: "McKenzie Albert",
      birthDate: "1987-01-31",
      residentCongregateSetting: true,
      employedInHealthcare: true,
      gender: null,
    };
    const facility = {
      id: "123",
    };
    const component = renderer.create(
      <Provider store={store}>
        <MockedProvider mocks={[]} addTypename={false}>
          <PatientForm
            patient={patient}
            activeFacilityId={facility.id}
            patientId={patient.internalId}
            isPxpView={true}
            backCallback={() => {}}
            saveCallback={() => {}}
          />
        </MockedProvider>
      </Provider>
    );

    expect(component.toJSON()).toMatchSnapshot();
  });
});

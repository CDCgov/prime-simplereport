import renderer from "react-test-renderer";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import PatientProfile from "./PatientProfile";

const mockStore = configureStore([]);
const mockContainer = (store: any, patient: any) => (
  <Provider store={store}>
    <PatientProfile patient={patient} />
  </Provider>
);

describe("PatientProfile", () => {
  it("snapshot", () => {
    const patient = {
      firstName: "Jane",
      lastName: "Doe",
      street: "24 Dreary Ln",
    };
    const store = mockStore({
      plid: "foo",
    });
    const component = renderer.create(mockContainer(store, patient));
    expect(component.toJSON()).toMatchSnapshot();
  });
});

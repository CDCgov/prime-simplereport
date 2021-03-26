import renderer from "react-test-renderer";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MemoryRouter } from "react-router";

import PatientProfile from "./PatientProfile";

const mockStore = configureStore([]);
const mockContainer = (store: any, patient: any) => (
  <MemoryRouter>
    <Provider store={store}>
      <PatientProfile patient={patient} />
    </Provider>
  </MemoryRouter>
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
  it("should redirect to '/' if no patient", () => {
    const store = mockStore({
      plid: "foo",
    });
    renderer.create(mockContainer(store, null));
    // eslint-disable-next-line no-restricted-globals
    expect(location.pathname).toEqual("/");
  });
});

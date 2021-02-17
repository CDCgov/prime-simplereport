import renderer from "react-test-renderer";
import { MockedProvider } from "@apollo/client/testing";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import PatientProfile from "./PatientProfile";

describe("PatientProfile", () => {
  it("snapshot", () => {
    const patient = {
      firstName: "Jane",
      lastName: "Doe",
      street: "24 Dreary Ln",
    };
    const component = renderer.create(<PatientProfile patient={patient} />);
    expect(component.toJSON()).toMatchSnapshot();
  });
});

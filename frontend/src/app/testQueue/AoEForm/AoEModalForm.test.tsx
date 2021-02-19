import renderer from "react-test-renderer";
import { MockedProvider } from "@apollo/client/testing";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import AoEModalForm from "./AoEModalForm";

describe("AoEModalForm", () => {
  it("snapshot", () => {
    const patient = {
      firstName: "Jane",
      lastName: "Doe",
      street: "24 Dreary Ln",
    };
    const component = renderer.create(<AoEModalForm patient={patient} />);
    expect(component.toJSON()).toMatchSnapshot();
  });
});

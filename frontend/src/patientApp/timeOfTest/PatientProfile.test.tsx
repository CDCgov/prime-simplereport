import renderer from "react-test-renderer";

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

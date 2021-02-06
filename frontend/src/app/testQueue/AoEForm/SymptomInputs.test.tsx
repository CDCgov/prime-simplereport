import { jsonToCSV } from "react-papaparse";
import renderer from "react-test-renderer";
import SymptomInputs from "./SymptomInputs";

describe("SymptomInputs", () => {
  it("snapshot", () => {
    const component = renderer.create(
      <SymptomInputs
        symptomListConfig={[]}
        noSymptoms={false}
        setNoSymptoms={jest.fn()}
        currentSymptoms={{}}
        setSymptoms={jest.fn()}
        onsetDate={""}
        setOnsetDate={jest.fn()}
        symptomError={undefined}
        symptomOnsetError={undefined}
      />
    );

    expect(component.toJSON()).toMatchSnapshot();
  });
});

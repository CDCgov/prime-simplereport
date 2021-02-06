import renderer from "react-test-renderer";
import PriorTestInputs from "./PriorTestInputs";

describe("PriorTestInputs", () => {
  it("snapshot", () => {
    const component = renderer.create(
      <PriorTestInputs
        testTypeConfig={[]}
        isFirstTest={false}
        setIsFirstTest={jest.fn()}
        priorTestDate={""}
        setPriorTestDate={jest.fn()}
        priorTestResult={""}
        setPriorTestResult={jest.fn()}
        priorTestType={""}
        setPriorTestType={jest.fn()}
        mostRecentTest={undefined}
      />
    );

    expect(component.toJSON()).toMatchSnapshot();
  });
});

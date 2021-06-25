import renderer from "react-test-renderer";
import { fireEvent, render, screen } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import MockDate from "mockdate";

import PriorTestInputs from "./PriorTestInputs";
import { LastTest } from "./AoEForm";

describe("PriorTestInputs", () => {
  beforeEach(() => {
    MockDate.set("2021-02-06");
  });

  it("snapshot", () => {
    const component = renderer.create(
      <PriorTestInputs
        testTypeConfig={[]}
        isFirstTest={false}
        setIsFirstTest={jest.fn()}
        priorTestDate={null}
        setPriorTestDate={jest.fn()}
        priorTestResult={null}
        setPriorTestResult={jest.fn()}
        priorTestType={""}
        setPriorTestType={jest.fn()}
        lastTest={undefined}
      />
    );

    expect(component.toJSON()).toMatchSnapshot();
  });

  describe("user has previous test", () => {
    let setPriorTestDateSpy: jest.Mock;
    let setPriorTestResultSpy: jest.Mock;
    let lastTest: LastTest;

    beforeEach(() => {
      setPriorTestDateSpy = jest.fn();
      setPriorTestResultSpy = jest.fn();

      lastTest = {
        dateTested: "2021-01-01",
        result: "NEGATIVE",
      };

      render(
        <MockedProvider>
          <PriorTestInputs
            testTypeConfig={[]}
            isFirstTest={false}
            setIsFirstTest={jest.fn()}
            priorTestDate={null}
            setPriorTestDate={setPriorTestDateSpy}
            priorTestResult={null}
            setPriorTestResult={setPriorTestResultSpy}
            priorTestType={undefined}
            setPriorTestType={jest.fn()}
            lastTest={lastTest}
          />
        </MockedProvider>
      );
    });

    it("sets prior test values to last test values", () => {
      const isPriorTestRadio = screen.getAllByRole("radio")[0];

      fireEvent.click(isPriorTestRadio);

      expect(setPriorTestDateSpy).toHaveBeenCalledTimes(1);
      expect(setPriorTestResultSpy).toHaveBeenCalledTimes(1);

      expect(setPriorTestDateSpy).toHaveBeenCalledWith("2021-01-01");
      expect(setPriorTestResultSpy).toHaveBeenCalledWith("NEGATIVE");
    });
  });
});

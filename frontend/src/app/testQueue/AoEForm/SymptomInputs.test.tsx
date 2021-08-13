import renderer from "react-test-renderer";
import MockDate from "mockdate";
import { createRef } from "react";

import SymptomInputs from "./SymptomInputs";

describe("SymptomInputs", () => {
  let component: renderer.ReactTestRenderer;
  let setNoSymptoms: jest.Mock;
  let setOnsetDate: jest.Mock;
  beforeEach(() => {
    MockDate.set("2021-02-08");
    setNoSymptoms = jest.fn();
    setOnsetDate = jest.fn();

    component = renderer.create(
      <SymptomInputs
        noSymptoms={false}
        setNoSymptoms={setNoSymptoms}
        currentSymptoms={{}}
        setSymptoms={jest.fn()}
        onsetDate={null}
        setOnsetDate={setOnsetDate}
        symptomError={undefined}
        symptomOnsetError={undefined}
        symptomRef={createRef()}
        symptomOnsetRef={createRef()}
      />
    );
  });

  it("renders", () => {
    expect(component.toJSON()).toMatchSnapshot();
  });

  describe("setting has symptoms", () => {
    describe("no symptoms", () => {
      beforeEach(async () => {
        renderer.act(() => {
          component.root
            .findByProps({ name: "no_symptoms" })
            .props.onChange({ target: { checked: false } });
        });
      });
      it("calls setNoSymptoms", () => {
        expect(setNoSymptoms).toHaveBeenCalledTimes(1);
      });
      it("calls setNoSymptoms with true", () => {
        expect(setNoSymptoms).toHaveBeenCalledWith(false);
      });
    });
    describe("symptoms", () => {
      beforeEach(async () => {
        renderer.act(() => {
          component.root
            .findByProps({ name: "no_symptoms" })
            .props.onChange({ target: { checked: true } });
        });
      });
      it("calls setNoSymptoms", () => {
        expect(setNoSymptoms).toHaveBeenCalledTimes(1);
      });
      it("calls setNoSymptoms with true", () => {
        expect(setNoSymptoms).toHaveBeenCalledWith(true);
      });
    });
  });

  describe("onset date", () => {
    beforeEach(async () => {
      renderer.act(() => {
        component.root
          .findByProps({ id: "symptom_onset" })
          .props.onChange("2021-06-03");
      });
    });

    it("calls setOnsetDate", () => {
      expect(setOnsetDate).toHaveBeenCalledTimes(1);
    });

    it("calls setOnsetDate with a date", () => {
      expect(setOnsetDate).toHaveBeenCalledWith("2021-06-03");
    });
  });
});

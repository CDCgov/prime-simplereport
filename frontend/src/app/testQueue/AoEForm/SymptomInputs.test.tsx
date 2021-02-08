import renderer, { act } from "react-test-renderer";
import SymptomInputs from "./SymptomInputs";

describe("SymptomInputs", () => {
  let component: renderer.ReactTestRenderer;
  let setNoSymptoms: jest.Mock;
  beforeEach(() => {
    setNoSymptoms = jest.fn();
    component = renderer.create(
      <SymptomInputs
        noSymptoms={false}
        setNoSymptoms={setNoSymptoms}
        currentSymptoms={{}}
        setSymptoms={jest.fn()}
        onsetDate={""}
        setOnsetDate={jest.fn()}
        symptomError={undefined}
        symptomOnsetError={undefined}
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
});

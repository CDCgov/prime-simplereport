import MockDate from "mockdate";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SymptomInputs from "./SymptomInputs";

describe("SymptomInputs", () => {
  let setNoSymptoms: jest.Mock;
  let setOnsetDate: jest.Mock;
  beforeEach(() => {
    MockDate.set("2021-02-08");
    setNoSymptoms = jest.fn();
    setOnsetDate = jest.fn();

    render(
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

  describe("setting has symptoms", () => {
    describe("no symptoms", () => {
      it("calls setNoSymptoms", () => {
        userEvent.click(screen.getByLabelText("No symptoms"));
        expect(setNoSymptoms).toHaveBeenCalledTimes(1);
        expect(setNoSymptoms).toHaveBeenCalledWith(true);
      });
    });
    describe("yes symptoms", () => {
      it("doesn't call setNoSymptoms", () => {
        userEvent.click(screen.getByLabelText("Chills", { exact: false }));
        expect(setNoSymptoms).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe("onset date", () => {
    it("calls setOnsetDate", () => {
      userEvent.type(
        screen.getByTestId("date-picker-external-input"),
        "2021-06-03"
      );
      // Gets called once per input character
      expect(setOnsetDate).toHaveBeenCalledTimes(10);
      expect(setOnsetDate).toHaveBeenCalledWith("2021-06-03");
    });
  });
});

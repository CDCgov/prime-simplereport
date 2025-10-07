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
      it("calls setNoSymptoms", async () => {
        await userEvent.click(screen.getByLabelText("No symptoms"));
        expect(setNoSymptoms).toHaveBeenCalledTimes(1);
        expect(setNoSymptoms).toHaveBeenCalledWith(true);
      });
    });
    describe("yes symptoms", () => {
      it("doesn't call setNoSymptoms", async () => {
        await userEvent.click(
          screen.getByLabelText("Chills", { exact: false })
        );
        expect(setNoSymptoms).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe("onset date", () => {
    it("calls setOnsetDate", async () => {
      await userEvent.type(
        screen.getByTestId("symptom_onset_date"),
        "2021-06-03"
      );
      expect(setOnsetDate).toHaveBeenCalledTimes(1);
      expect(setOnsetDate).toHaveBeenCalledWith("2021-06-03");
    });
  });
});

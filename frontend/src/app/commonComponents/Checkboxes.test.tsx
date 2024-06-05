import Checkboxes, { generateCheckboxColumns } from "./Checkboxes";
import {
  respiratorySymptomDefinitions,
  SYMPTOM_SUBQUESTION_ERROR,
} from "../../patientApp/timeOfTest/constants";
import React from "react";
import { render, screen } from "@testing-library/react";

describe("generateCheckboxColumns", () => {
  it("creates array of arrays, subarrays of length n, when passed an array of items and n", () => {
    const testArray = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    expect(generateCheckboxColumns(testArray, 3)).toEqual([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ]);
  });
});

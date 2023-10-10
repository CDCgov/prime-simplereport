import React from "react";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { within } from "@storybook/testing-library";

import CovidResultInputGroup from "./CovidResultInputGroup";

describe("CovidResultInputGroup", () => {
  const onChangeMock = jest.fn();
  const queueItemId = "QUEUE-ITEM-ID";

  async function renderCovidResultInputGroup() {
    jest.spyOn(global.Math, "random").mockReturnValue(1);

    const { container } = render(
      <CovidResultInputGroup
        queueItemId={queueItemId}
        testResults={[]}
        onChange={onChangeMock}
      ></CovidResultInputGroup>
    );
    return { container, user: userEvent.setup() };
  }

  it("matches snapshot", async () => {
    expect(await renderCovidResultInputGroup()).toMatchSnapshot();
  });

  it("calls onChange when result selected", async () => {
    const { user } = await renderCovidResultInputGroup();

    await user.click(
      within(
        screen.getByTestId(`covid-test-result-${queueItemId}`)
      ).getByLabelText("Negative (-)")
    );
    expect(onChangeMock).toHaveBeenCalledWith([
      { diseaseName: "COVID-19", testResult: "NEGATIVE" },
    ]);

    await user.click(
      within(
        screen.getByTestId(`covid-test-result-${queueItemId}`)
      ).getByLabelText("Inconclusive")
    );
    expect(onChangeMock).toHaveBeenCalledWith([
      { diseaseName: "COVID-19", testResult: "UNDETERMINED" },
    ]);

    await user.click(
      within(
        screen.getByTestId(`covid-test-result-${queueItemId}`)
      ).getByLabelText("Positive (+)")
    );
    expect(onChangeMock).toHaveBeenCalledWith([
      { diseaseName: "COVID-19", testResult: "POSITIVE" },
    ]);
  });
});

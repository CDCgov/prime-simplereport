import React from "react";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { within } from "@storybook/testing-library";

import mockSupportedDiseaseCovid from "../../mocks/mockSupportedDiseaseCovid";
import { mockSupportedDiseaseFlu } from "../../mocks/mockSupportedDiseaseMultiplex";

import MultiplexResultInputGroup from "./MultiplexResultInputGroup";

describe("MultiplexResultInputGroup", () => {
  const onChangeMock = jest.fn();
  const queueItemId = "QUEUE-ITEM-ID";

  const device1Name = "LumiraDX";
  const device2Name = "Abbott BinaxNow";
  const specimen1Name = "Swab of internal nose";
  const specimen1Id = "SPECIMEN-1-ID";
  const specimen2Name = "Nasopharyngeal swab";
  const specimen2Id = "SPECIMEN-2-ID";
  const device1Id = "DEVICE-1-ID";
  const device2Id = "DEVICE-2-ID";

  const testRestults = [
    { diseaseName: "COVID-19", testResult: "POSITIVE" },
    { diseaseName: "Flu A", testResult: "POSITIVE" },
    { diseaseName: "Flu B", testResult: "POSITIVE" },
  ];

  const deviceTypes = [
    {
      internalId: device1Id,
      name: device1Name,
      testLength: 15,
      supportedDiseaseTestPerformed: mockSupportedDiseaseCovid,
      swabTypes: [
        {
          name: specimen1Name,
          internalId: specimen1Id,
          typeCode: "445297001",
        },
        {
          name: specimen2Name,
          internalId: specimen2Id,
          typeCode: "258500001",
        },
      ],
    },
    {
      internalId: device2Id,
      name: device2Name,
      testLength: 15,
      supportedDiseaseTestPerformed: mockSupportedDiseaseFlu,
      swabTypes: [
        {
          name: specimen1Name,
          internalId: specimen1Id,
          typeCode: "445297001",
        },
      ],
    },
  ];

  const devicesMap = new Map();
  deviceTypes.map((d) => devicesMap.set(d.internalId, d));

  async function renderMultiplexResultInputGroup(deviceId?: string) {
    jest.spyOn(global.Math, "random").mockReturnValue(1);

    const { container } = render(
      <MultiplexResultInputGroup
        queueItemId={queueItemId}
        testResults={testRestults}
        deviceId={deviceId || device1Id}
        devicesMap={devicesMap}
        onChange={onChangeMock}
      ></MultiplexResultInputGroup>
    );
    return { container, user: userEvent.setup() };
  }

  it("matches snapshot", async () => {
    expect(await renderMultiplexResultInputGroup()).toMatchSnapshot();
  });

  it("calls onChange when result", async () => {
    const { user } = await renderMultiplexResultInputGroup();

    await user.click(
      within(
        screen.getByTestId(`covid-test-result-${queueItemId}`)
      ).getByLabelText("Negative (-)")
    );
    expect(onChangeMock).toHaveBeenCalledWith([
      { diseaseName: "COVID-19", testResult: "NEGATIVE" },
      { diseaseName: "Flu A", testResult: "POSITIVE" },
      { diseaseName: "Flu B", testResult: "POSITIVE" },
    ]);

    await user.click(
      within(
        screen.getByTestId(`flu-a-test-result-${queueItemId}`)
      ).getByLabelText("Negative (-)")
    );
    expect(onChangeMock).toHaveBeenCalledWith([
      { diseaseName: "COVID-19", testResult: "NEGATIVE" },
      { diseaseName: "Flu A", testResult: "NEGATIVE" },
      { diseaseName: "Flu B", testResult: "POSITIVE" },
    ]);

    await user.click(
      within(
        screen.getByTestId(`flu-b-test-result-${queueItemId}`)
      ).getByLabelText("Negative (-)")
    );
    expect(onChangeMock).toHaveBeenCalledWith([
      { diseaseName: "COVID-19", testResult: "NEGATIVE" },
      { diseaseName: "Flu A", testResult: "NEGATIVE" },
      { diseaseName: "Flu B", testResult: "NEGATIVE" },
    ]);
  });

  it("doesnt show covid result input with flu only device", async () => {
    await renderMultiplexResultInputGroup(device2Id);

    expect(
      screen.queryByTestId(`covid-test-result-${queueItemId}`)
    ).not.toBeInTheDocument();
    expect(
      screen.getByTestId(`flu-a-test-result-${queueItemId}`)
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(`flu-b-test-result-${queueItemId}`)
    ).toBeInTheDocument();
  });
});

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import MultiplexResultInputForm from "./MultiplexResultInputForm";
import { MULTIPLEX_DISEASES, TEST_RESULTS } from "./constants";

import spyOn = jest.spyOn;

describe("TestResultInputForm", () => {
  const onChangeFn = jest.fn();
  const onSubmitFn = jest.fn();

  it("should render with a value", () => {
    render(
      <MultiplexResultInputForm
        queueItemId={"5d315d18-82f8-4025-a051-1a509e15c880"}
        testResults={[
          {
            diseaseName: MULTIPLEX_DISEASES.COVID_19,
            testResult: TEST_RESULTS.POSITIVE,
          },
          {
            diseaseName: MULTIPLEX_DISEASES.FLU_A,
            testResult: TEST_RESULTS.NEGATIVE,
          },
          {
            diseaseName: MULTIPLEX_DISEASES.FLU_B,
            testResult: TEST_RESULTS.NEGATIVE,
          },
        ]}
        isSubmitDisabled={undefined}
        onChange={onChangeFn}
        onSubmit={onSubmitFn}
      />
    );

    expect(screen.getByText("Flu A")).toBeInTheDocument();
    expect(screen.getByText("Flu B")).toBeInTheDocument();

    expect(screen.getAllByLabelText("Positive (+)")[0]).toBeChecked();
    expect(screen.getAllByLabelText("Positive (+)")[1]).not.toBeChecked();
    expect(screen.getAllByLabelText("Positive (+)")[2]).not.toBeChecked();
    expect(screen.getAllByLabelText("Negative (-)")[0]).not.toBeChecked();
    expect(screen.getAllByLabelText("Negative (-)")[1]).toBeChecked();
    expect(screen.getAllByLabelText("Negative (-)")[2]).toBeChecked();
    expect(
      screen.getByLabelText("inconclusive", { exact: false })
    ).not.toBeChecked();
  });
  it("should still render even if the testResults prop is mistakenly passed as null", () => {
    render(
      <MultiplexResultInputForm
        queueItemId={"5d315d18-82f8-4025-a051-1a509e15c880"}
        // @ts-ignore this is forcing a weird edge case on runtime
        testResults={null}
        isSubmitDisabled={undefined}
        onChange={onChangeFn}
        onSubmit={onSubmitFn}
      />
    );

    expect(screen.getByText("Flu A")).toBeInTheDocument();
    expect(screen.getByText("Flu B")).toBeInTheDocument();

    expect(screen.getAllByLabelText("Positive (+)")[0]).not.toBeChecked();
    expect(screen.getAllByLabelText("Positive (+)")[1]).not.toBeChecked();
    expect(screen.getAllByLabelText("Positive (+)")[2]).not.toBeChecked();
    expect(screen.getAllByLabelText("Negative (-)")[0]).not.toBeChecked();
    expect(screen.getAllByLabelText("Negative (-)")[1]).not.toBeChecked();
    expect(screen.getAllByLabelText("Negative (-)")[2]).not.toBeChecked();
    expect(
      screen.getByLabelText("inconclusive", { exact: false })
    ).not.toBeChecked();
  });

  it("should render without a value", () => {
    render(
      <MultiplexResultInputForm
        queueItemId={"5d315d18-82f8-4025-a051-1a509e15c880"}
        testResults={[]}
        onChange={onChangeFn}
        onSubmit={onSubmitFn}
      />
    );

    expect(screen.getAllByLabelText("Positive (+)")[0]).not.toBeChecked();
    expect(screen.getAllByLabelText("Positive (+)")[1]).not.toBeChecked();
    expect(screen.getAllByLabelText("Positive (+)")[2]).not.toBeChecked();
    expect(screen.getAllByLabelText("Negative (-)")[0]).not.toBeChecked();
    expect(screen.getAllByLabelText("Negative (-)")[1]).not.toBeChecked();
    expect(screen.getAllByLabelText("Negative (-)")[2]).not.toBeChecked();
    expect(
      screen.getByLabelText("inconclusive", { exact: false })
    ).not.toBeChecked();
  });
  it("should pass back a COVID-19 result value when clicked", async () => {
    render(
      <MultiplexResultInputForm
        queueItemId={"5d315d18-82f8-4025-a051-1a509e15c880"}
        testResults={[]}
        onChange={onChangeFn}
        onSubmit={onSubmitFn}
      />
    );

    userEvent.click(screen.getAllByLabelText("Negative (-)")[0]);
    expect(onChangeFn).toBeCalledWith([
      {
        diseaseName: MULTIPLEX_DISEASES.COVID_19,
        testResult: TEST_RESULTS.NEGATIVE,
      },
    ]);
  });
  it("should pass back a Flu A result value when clicked", async () => {
    render(
      <MultiplexResultInputForm
        queueItemId={"5d315d18-82f8-4025-a051-1a509e15c880"}
        testResults={[]}
        onChange={onChangeFn}
        onSubmit={onSubmitFn}
      />
    );

    userEvent.click(screen.getAllByLabelText("Negative (-)")[1]);
    expect(onChangeFn).toBeCalledWith([
      {
        diseaseName: MULTIPLEX_DISEASES.FLU_A,
        testResult: TEST_RESULTS.NEGATIVE,
      },
    ]);
  });
  it("should pass back a Flu B result value when clicked", async () => {
    render(
      <MultiplexResultInputForm
        queueItemId={"5d315d18-82f8-4025-a051-1a509e15c880"}
        testResults={[]}
        onChange={onChangeFn}
        onSubmit={onSubmitFn}
      />
    );

    userEvent.click(screen.getAllByLabelText("Negative (-)")[2]);
    expect(onChangeFn).toBeCalledWith([
      {
        diseaseName: MULTIPLEX_DISEASES.FLU_B,
        testResult: TEST_RESULTS.NEGATIVE,
      },
    ]);
  });

  it("should render with inconclusive multiplex values", () => {
    render(
      <MultiplexResultInputForm
        queueItemId={"5d315d18-82f8-4025-a051-1a509e15c880"}
        testResults={[
          {
            diseaseName: MULTIPLEX_DISEASES.COVID_19,
            testResult: TEST_RESULTS.UNDETERMINED,
          },
          {
            diseaseName: MULTIPLEX_DISEASES.FLU_A,
            testResult: TEST_RESULTS.UNDETERMINED,
          },
          {
            diseaseName: MULTIPLEX_DISEASES.FLU_B,
            testResult: TEST_RESULTS.UNDETERMINED,
          },
        ]}
        onChange={onChangeFn}
        onSubmit={onSubmitFn}
      />
    );

    expect(screen.getAllByLabelText("Positive (+)")[0]).not.toBeChecked();
    expect(screen.getAllByLabelText("Positive (+)")[1]).not.toBeChecked();
    expect(screen.getAllByLabelText("Positive (+)")[2]).not.toBeChecked();
    expect(screen.getAllByLabelText("Negative (-)")[0]).not.toBeChecked();
    expect(screen.getAllByLabelText("Negative (-)")[1]).not.toBeChecked();
    expect(screen.getAllByLabelText("Negative (-)")[2]).not.toBeChecked();
    expect(
      screen.getByRole("checkbox", { name: /mark test as inconclusive/i })
    ).toBeChecked();
    expect(screen.getByText("Submit")).toBeEnabled();
  });

  it("should display submit button as disabled when diseases have unset values", () => {
    render(
      <MultiplexResultInputForm
        queueItemId={"5d315d18-82f8-4025-a051-1a509e15c880"}
        testResults={[
          {
            diseaseName: MULTIPLEX_DISEASES.COVID_19,
            testResult: TEST_RESULTS.POSITIVE,
          },
        ]}
        onChange={onChangeFn}
        onSubmit={onSubmitFn}
      />
    );
    expect(screen.getByText("Submit")).toBeDisabled();
    userEvent.click(screen.getByText("Submit"));
    expect(onSubmitFn).toHaveBeenCalledTimes(0);
  });
  it("should display submit button as disabled when diseases have a weird mix of UNDETERMINED an set values", () => {
    render(
      <MultiplexResultInputForm
        queueItemId={"5d315d18-82f8-4025-a051-1a509e15c880"}
        testResults={[
          {
            diseaseName: MULTIPLEX_DISEASES.COVID_19,
            testResult: TEST_RESULTS.POSITIVE,
          },
          {
            diseaseName: MULTIPLEX_DISEASES.FLU_A,
            testResult: TEST_RESULTS.UNDETERMINED,
          },
          {
            diseaseName: MULTIPLEX_DISEASES.FLU_B,
            testResult: TEST_RESULTS.UNDETERMINED,
          },
        ]}
        onChange={onChangeFn}
        onSubmit={onSubmitFn}
      />
    );
    expect(screen.getByText("Submit")).toBeDisabled();
    userEvent.click(screen.getByText("Submit"));
    expect(onSubmitFn).toHaveBeenCalledTimes(0);
  });
  it("should send results marked as inconclusive when checkbox is checked", async () => {
    render(
      <MultiplexResultInputForm
        queueItemId={"5d315d18-82f8-4025-a051-1a509e15c880"}
        testResults={[
          {
            diseaseName: MULTIPLEX_DISEASES.COVID_19,
            testResult: TEST_RESULTS.POSITIVE,
          },
          {
            diseaseName: MULTIPLEX_DISEASES.FLU_A,
            testResult: TEST_RESULTS.NEGATIVE,
          },
          {
            diseaseName: MULTIPLEX_DISEASES.FLU_B,
            testResult: TEST_RESULTS.NEGATIVE,
          },
        ]}
        onChange={onChangeFn}
        onSubmit={onSubmitFn}
      />
    );
    expect(screen.getAllByLabelText("Positive (+)")[0]).toBeChecked();
    expect(screen.getAllByLabelText("Negative (-)")[1]).toBeChecked();
    expect(screen.getAllByLabelText("Negative (-)")[2]).toBeChecked();
    userEvent.click(screen.getByLabelText("inconclusive", { exact: false }));
    expect(onChangeFn).toHaveBeenCalledWith([
      {
        diseaseName: MULTIPLEX_DISEASES.COVID_19,
        testResult: TEST_RESULTS.UNDETERMINED,
      },
      {
        diseaseName: MULTIPLEX_DISEASES.FLU_A,
        testResult: TEST_RESULTS.UNDETERMINED,
      },
      {
        diseaseName: MULTIPLEX_DISEASES.FLU_B,
        testResult: TEST_RESULTS.UNDETERMINED,
      },
    ]);
  });
  it("should send correct test values when inconclusive checkbox is checked but user switches to positive/negative result", async () => {
    render(
      <MultiplexResultInputForm
        queueItemId={"5d315d18-82f8-4025-a051-1a509e15c880"}
        testResults={[
          {
            diseaseName: MULTIPLEX_DISEASES.COVID_19,
            testResult: TEST_RESULTS.UNDETERMINED,
          },
          {
            diseaseName: MULTIPLEX_DISEASES.FLU_A,
            testResult: TEST_RESULTS.UNDETERMINED,
          },
          {
            diseaseName: MULTIPLEX_DISEASES.FLU_B,
            testResult: TEST_RESULTS.UNDETERMINED,
          },
        ]}
        onChange={onChangeFn}
        onSubmit={onSubmitFn}
      />
    );

    expect(
      screen.getByRole("checkbox", { name: /mark test as inconclusive/i })
    ).toBeChecked();
    expect(screen.getAllByLabelText("Positive (+)")[0]).not.toBeChecked();
    expect(screen.getAllByLabelText("Positive (+)")[1]).not.toBeChecked();
    expect(screen.getAllByLabelText("Positive (+)")[2]).not.toBeChecked();
    expect(screen.getAllByLabelText("Negative (-)")[0]).not.toBeChecked();
    expect(screen.getAllByLabelText("Negative (-)")[1]).not.toBeChecked();
    expect(screen.getAllByLabelText("Negative (-)")[2]).not.toBeChecked();
    userEvent.click(
      screen.getAllByRole("radio", { name: /positive \(\+\)/i })[0]
    );

    expect(onChangeFn).toHaveBeenCalledWith([
      {
        diseaseName: MULTIPLEX_DISEASES.COVID_19,
        testResult: TEST_RESULTS.POSITIVE,
      },
      {
        diseaseName: MULTIPLEX_DISEASES.FLU_A,
        testResult: TEST_RESULTS.UNDETERMINED,
      },
      {
        diseaseName: MULTIPLEX_DISEASES.FLU_B,
        testResult: TEST_RESULTS.UNDETERMINED,
      },
    ]);
  });
  it("should trigger submit for parent component when submit button is clicked", () => {
    render(
      <MultiplexResultInputForm
        queueItemId={"5d315d18-82f8-4025-a051-1a509e15c880"}
        testResults={[
          {
            diseaseName: MULTIPLEX_DISEASES.COVID_19,
            testResult: TEST_RESULTS.POSITIVE,
          },
          {
            diseaseName: MULTIPLEX_DISEASES.FLU_A,
            testResult: TEST_RESULTS.POSITIVE,
          },
          {
            diseaseName: MULTIPLEX_DISEASES.FLU_B,
            testResult: TEST_RESULTS.POSITIVE,
          },
        ]}
        onChange={onChangeFn}
        onSubmit={onSubmitFn}
      />
    );
    expect(screen.getByRole("button", { name: /submit/i })).toBeEnabled();
    const clickEvent = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
    });

    const preventDefaultSpy = spyOn(clickEvent, "preventDefault");
    fireEvent(screen.getByRole("button", { name: /submit/i }), clickEvent);
    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(onSubmitFn).toHaveBeenCalled();
  });
});

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import MultiplexResultInputForm from "./MultiplexResultInputForm";

// jest.mock("uuid");

describe("TestResultInputForm", () => {
  const onChangeFn = jest.fn();
  const onSubmitFn = jest.fn();

  it("should render with a value", () => {
    render(
      <MultiplexResultInputForm
        queueItemId={"5d315d18-82f8-4025-a051-1a509e15c880"}
        testResults={[
          {
            diseaseName: "COVID-19",
            testResult: "POSITIVE",
          },
          {
            diseaseName: "Flu A",
            testResult: "NEGATIVE",
          },
          {
            diseaseName: "Flu B",
            testResult: "NEGATIVE",
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
      { diseaseName: "COVID-19", testResult: "NEGATIVE" },
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
      { diseaseName: "Flu A", testResult: "NEGATIVE" },
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
      { diseaseName: "Flu B", testResult: "NEGATIVE" },
    ]);
  });

  it("should render with inconclusive multiplex values", () => {
    render(
      <MultiplexResultInputForm
        queueItemId={"5d315d18-82f8-4025-a051-1a509e15c880"}
        testResults={[
          {
            diseaseName: "COVID-19",
            testResult: "UNDETERMINED",
          },
          {
            diseaseName: "Flu A",
            testResult: "UNDETERMINED",
          },
          {
            diseaseName: "Flu B",
            testResult: "UNDETERMINED",
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
      screen.getByLabelText("inconclusive", { exact: false })
    ).toBeChecked();
    expect(screen.getByText("Submit")).toBeEnabled();
  });
  it("should display submit button as disabled when diseases have unset values", () => {
    render(
      <MultiplexResultInputForm
        queueItemId={"5d315d18-82f8-4025-a051-1a509e15c880"}
        testResults={[
          {
            diseaseName: "COVID-19",
            testResult: "POSITIVE",
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
            diseaseName: "COVID-19",
            testResult: "POSITIVE",
          },
          { diseaseName: "Flu A", testResult: "UNDETERMINED" },
          { diseaseName: "Flu B", testResult: "UNDETERMINED" },
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
            diseaseName: "COVID-19",
            testResult: "POSITIVE",
          },
          {
            diseaseName: "Flu A",
            testResult: "NEGATIVE",
          },
          {
            diseaseName: "Flu B",
            testResult: "NEGATIVE",
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
      { diseaseName: "COVID-19", testResult: "UNDETERMINED" },
      { diseaseName: "Flu A", testResult: "UNDETERMINED" },
      { diseaseName: "Flu B", testResult: "UNDETERMINED" },
    ]);
  });
  it("should submit correct test values when inconclusive checkbox is checked but user switches to positive/negative result", async () => {
    render(
      <MultiplexResultInputForm
        queueItemId={"5d315d18-82f8-4025-a051-1a509e15c880"}
        testResults={[
          { diseaseName: "COVID-19", testResult: "UNDETERMINED" },
          { diseaseName: "Flu A", testResult: "UNDETERMINED" },
          { diseaseName: "Flu B", testResult: "UNDETERMINED" },
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
      { diseaseName: "COVID-19", testResult: "POSITIVE" },
      { diseaseName: "Flu A", testResult: "UNDETERMINED" },
      { diseaseName: "Flu B", testResult: "UNDETERMINED" },
    ]);
  });
});

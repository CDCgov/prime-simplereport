import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { MultiplexResultInput } from "../../generated/graphql";

import CovidResultInputForm from "./CovidResultInputForm";

describe("TestResultInputForm", () => {
  const positiveResult: MultiplexResultInput[] = [
    {
      diseaseName: "COVID-19",
      testResult: "POSITIVE",
    },
  ];

  const onChangeFn = jest.fn();
  const onSubmitFn = jest.fn();

  it("should render with a value", () => {
    render(
      <CovidResultInputForm
        queueItemId={"5d315d18-82f8-4025-a051-1a509e15c880"}
        testResults={positiveResult}
        isSubmitDisabled={undefined}
        onChange={onChangeFn}
        onSubmit={onSubmitFn}
      />
    );

    expect(screen.getByLabelText("Positive (+)")).toBeChecked();
    expect(screen.getByLabelText("Negative (-)")).not.toBeChecked();
    expect(screen.getByLabelText("Inconclusive")).not.toBeChecked();
  });

  it("should render without a value", () => {
    render(
      <CovidResultInputForm
        queueItemId={"5d315d18-82f8-4025-a051-1a509e15c880"}
        testResults={[]}
        onChange={onChangeFn}
        onSubmit={onSubmitFn}
      />
    );

    expect(screen.getByLabelText("Positive (+)")).not.toBeChecked();
    expect(screen.getByLabelText("Negative (-)")).not.toBeChecked();
    expect(screen.getByLabelText("Inconclusive")).not.toBeChecked();
  });

  it("should pass back the result value when clicked", async () => {
    render(
      <CovidResultInputForm
        queueItemId={"5d315d18-82f8-4025-a051-1a509e15c880"}
        testResults={[]}
        onChange={onChangeFn}
        onSubmit={onSubmitFn}
      />
    );

    userEvent.click(screen.getByLabelText("Negative (-)"));
    expect(onChangeFn).toBeCalledWith([
      { diseaseName: "COVID-19", testResult: "NEGATIVE" },
    ]);
  });

  it("should not submit when there is no value", () => {
    render(
      <CovidResultInputForm
        queueItemId={"5d315d18-82f8-4025-a051-1a509e15c880"}
        testResults={[]}
        onChange={onChangeFn}
        onSubmit={onSubmitFn}
      />
    );
    expect(screen.getByText("Submit")).toBeDisabled();
    userEvent.click(screen.getByText("Submit"));
    expect(onSubmitFn).toHaveBeenCalledTimes(0);
  });

  it("should not submit when there is a value but isSubmit is disabled", () => {
    render(
      <CovidResultInputForm
        queueItemId={"5d315d18-82f8-4025-a051-1a509e15c880"}
        testResults={positiveResult}
        isSubmitDisabled={true}
        onChange={onChangeFn}
        onSubmit={onSubmitFn}
      />
    );
    expect(screen.getByText("Submit")).toBeDisabled();
    userEvent.click(screen.getByText("Submit"));
    expect(onSubmitFn).toHaveBeenCalledTimes(0);
  });

  it("should submit when there is a value but isSubmit is enabled", () => {
    render(
      <CovidResultInputForm
        queueItemId={"5d315d18-82f8-4025-a051-1a509e15c880"}
        testResults={positiveResult}
        isSubmitDisabled={false}
        onChange={onChangeFn}
        onSubmit={onSubmitFn}
      />
    );
    expect(screen.getByText("Submit")).toBeEnabled();
    userEvent.click(screen.getByText("Submit"));
    expect(onSubmitFn).toHaveBeenCalledTimes(1);
  });

  it("should submit when isSubmitDisabled is not passed as prop", () => {
    render(
      <CovidResultInputForm
        queueItemId={"5d315d18-82f8-4025-a051-1a509e15c880"}
        testResults={positiveResult}
        onChange={onChangeFn}
        onSubmit={onSubmitFn}
      />
    );
    expect(screen.getByText("Submit")).toBeEnabled();
    userEvent.click(screen.getByText("Submit"));
    expect(onSubmitFn).toHaveBeenCalledTimes(1);
  });
});

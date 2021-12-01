import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import TestResultInputForm from "./TestResultInputForm";

jest.mock("uuid");

describe("TestResultInputForm", () => {
  it("should render with a value", () => {
    render(
      <TestResultInputForm
        queueItemId={"5d315d18-82f8-4025-a051-1a509e15c880"}
        testResultValue="POSITIVE"
        isSubmitDisabled={undefined}
        onChange={jest.fn()}
        onSubmit={jest.fn()}
      />
    );

    expect(screen.getByLabelText("Positive (+)")).toBeChecked();
    expect(screen.getByLabelText("Negative (-)")).not.toBeChecked();
    expect(screen.getByLabelText("Inconclusive")).not.toBeChecked();
  });

  it("should render without a value", () => {
    render(
      <TestResultInputForm
        queueItemId={"5d315d18-82f8-4025-a051-1a509e15c880"}
        testResultValue={undefined}
        onChange={jest.fn()}
        onSubmit={jest.fn()}
      />
    );

    expect(screen.getByLabelText("Positive (+)")).not.toBeChecked();
    expect(screen.getByLabelText("Negative (-)")).not.toBeChecked();
    expect(screen.getByLabelText("Inconclusive")).not.toBeChecked();
  });

  it("should pass back the result value when clicked", () => {
    const onChange = jest.fn();
    render(
      <TestResultInputForm
        queueItemId={"5d315d18-82f8-4025-a051-1a509e15c880"}
        testResultValue={undefined}
        onChange={onChange}
        onSubmit={jest.fn()}
      />
    );

    userEvent.click(screen.getByLabelText("Negative (-)"));

    expect(onChange).toBeCalledWith("NEGATIVE");
  });

  it("should remove value when it is already selected", () => {
    const onChange = jest.fn();
    render(
      <TestResultInputForm
        queueItemId={"5d315d18-82f8-4025-a051-1a509e15c880"}
        testResultValue="POSITIVE"
        onChange={onChange}
        onSubmit={jest.fn()}
      />
    );

    userEvent.click(screen.getByLabelText("Positive (+)"));

    expect(onChange).toBeCalledWith(undefined);
  });

  it("should not submit when there is no value", () => {
    const onSubmit = jest.fn();
    render(
      <TestResultInputForm
        queueItemId={"5d315d18-82f8-4025-a051-1a509e15c880"}
        testResultValue={undefined}
        onChange={jest.fn()}
        onSubmit={onSubmit}
      />
    );

    userEvent.click(screen.getByText("Submit"));

    expect(onSubmit).toHaveBeenCalledTimes(0);
  });

  it("should not submit when there is a value but isSubmit is disabled", () => {
    const onSubmit = jest.fn();
    render(
      <TestResultInputForm
        queueItemId={"5d315d18-82f8-4025-a051-1a509e15c880"}
        testResultValue="POSITIVE"
        isSubmitDisabled={true}
        onChange={jest.fn()}
        onSubmit={onSubmit}
      />
    );

    userEvent.click(screen.getByText("Submit"));

    expect(onSubmit).toHaveBeenCalledTimes(0);
  });

  it("should submit when there is a value but isSubmit is enabled", () => {
    const onSubmit = jest.fn();
    render(
      <TestResultInputForm
        queueItemId={"5d315d18-82f8-4025-a051-1a509e15c880"}
        testResultValue="POSITIVE"
        isSubmitDisabled={false}
        onChange={jest.fn()}
        onSubmit={onSubmit}
      />
    );

    userEvent.click(screen.getByText("Submit"));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("should submit when there is a value", () => {
    const onSubmit = jest.fn();
    render(
      <TestResultInputForm
        queueItemId={"5d315d18-82f8-4025-a051-1a509e15c880"}
        testResultValue="POSITIVE"
        onChange={jest.fn()}
        onSubmit={onSubmit}
      />
    );

    userEvent.click(screen.getByText("Submit"));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});

import React from "react";
import renderer from "react-test-renderer";
import { render, fireEvent, screen } from "@testing-library/react";
import TestResultInputForm from "./TestResultInputForm";

jest.mock("uuid");

describe("TestResultInputForm", () => {
  it("should render with a value", () => {
    const component = renderer.create(
      <TestResultInputForm
        queueItemId={"5d315d18-82f8-4025-a051-1a509e15c880"}
        testResultValue="POSITIVE"
        onChange={jest.fn()}
        onSubmit={jest.fn()}
      />
    );

    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should render without a value", () => {
    const component = renderer.create(
      <TestResultInputForm
        queueItemId={"5d315d18-82f8-4025-a051-1a509e15c880"}
        testResultValue={undefined}
        onChange={jest.fn()}
        onSubmit={jest.fn()}
      />
    );

    expect(component.toJSON()).toMatchSnapshot();
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

    fireEvent.click(screen.getByLabelText("Negative (-)"));

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

    fireEvent.click(screen.getByLabelText("Positive (+)"));

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

    fireEvent.click(screen.getByText("Submit"));

    expect(onSubmit).toHaveBeenCalledTimes(0);
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

    fireEvent.click(screen.getByText("Submit"));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});

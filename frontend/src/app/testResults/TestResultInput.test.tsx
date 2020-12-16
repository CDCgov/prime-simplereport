import React from "react";
import renderer from "react-test-renderer";
import { render, fireEvent, screen } from "@testing-library/react";
import { v4 as uuidv4 } from "uuid";
import TestResultInputForm from "./TestResultInputForm";

jest.mock("uuid");

describe("TestResultInputForm", () => {
  beforeEach(() => {
    (uuidv4 as any).mockImplementationOnce(() => "a");
    (uuidv4 as any).mockImplementationOnce(() => "b");
    (uuidv4 as any).mockImplementationOnce(() => "c");
    (uuidv4 as any).mockImplementationOnce(() => "d");
  });

  it("should render with a value", () => {
    const component = renderer.create(
      <TestResultInputForm
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
        testResultValue="POSITIVE"
        onChange={onChange}
        onSubmit={jest.fn()}
      />
    );

    fireEvent.click(screen.getByLabelText("Positive (+)"));

    expect(onChange).toHaveBeenCalledTimes(0);
  });

  it("should not submit when there is no value", () => {
    const onSubmit = jest.fn();
    render(
      <TestResultInputForm
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
        testResultValue="POSITIVE"
        onChange={jest.fn()}
        onSubmit={onSubmit}
      />
    );

    fireEvent.click(screen.getByText("Submit"));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});

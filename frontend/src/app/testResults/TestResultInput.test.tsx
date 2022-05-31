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
        covidResult="POSITIVE"
        supportsMultipleDiseases={false}
        isSubmitDisabled={undefined}
        onTestResultChange={jest.fn()}
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
        covidResult={undefined}
        supportsMultipleDiseases={false}
        onTestResultChange={jest.fn()}
        onSubmit={jest.fn()}
      />
    );

    expect(screen.getByLabelText("Positive (+)")).not.toBeChecked();
    expect(screen.getByLabelText("Negative (-)")).not.toBeChecked();
    expect(screen.getByLabelText("Inconclusive")).not.toBeChecked();
  });

  it("should pass back the result value when clicked", async () => {
    const onChange = jest.fn();
    const onTestResultChange = jest.fn((_name: string) => onChange);
    render(
      <TestResultInputForm
        queueItemId={"5d315d18-82f8-4025-a051-1a509e15c880"}
        covidResult={undefined}
        supportsMultipleDiseases={false}
        onTestResultChange={onTestResultChange}
        onSubmit={jest.fn()}
      />
    );

    userEvent.click(screen.getByLabelText("Negative (-)"));

    expect(onChange).toBeCalledWith("NEGATIVE");
  });

  it("should remove value when it is already selected", () => {
    const onChange = jest.fn();
    const onTestResultChange = jest.fn((_name: string) => onChange);
    render(
      <TestResultInputForm
        queueItemId={"5d315d18-82f8-4025-a051-1a509e15c880"}
        covidResult="POSITIVE"
        supportsMultipleDiseases={false}
        onTestResultChange={onTestResultChange}
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
        covidResult={undefined}
        supportsMultipleDiseases={false}
        onTestResultChange={jest.fn()}
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
        covidResult="POSITIVE"
        supportsMultipleDiseases={false}
        isSubmitDisabled={true}
        onTestResultChange={jest.fn()}
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
        covidResult="POSITIVE"
        supportsMultipleDiseases={false}
        isSubmitDisabled={false}
        onTestResultChange={jest.fn()}
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
        covidResult="POSITIVE"
        supportsMultipleDiseases={false}
        onTestResultChange={jest.fn()}
        onSubmit={onSubmit}
      />
    );

    userEvent.click(screen.getByText("Submit"));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("should render with multiplex values", () => {
    render(
      <TestResultInputForm
        queueItemId={"5d315d18-82f8-4025-a051-1a509e15c880"}
        covidResult="POSITIVE"
        fluAResult="NEGATIVE"
        fluBResult="NEGATIVE"
        supportsMultipleDiseases={true}
        isSubmitDisabled={undefined}
        onTestResultChange={jest.fn()}
        onSubmit={jest.fn()}
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

  it("should render without multiplex values", () => {
    render(
      <TestResultInputForm
        queueItemId={"5d315d18-82f8-4025-a051-1a509e15c880"}
        covidResult={undefined}
        fluAResult={undefined}
        fluBResult={undefined}
        supportsMultipleDiseases={true}
        onTestResultChange={jest.fn()}
        onSubmit={jest.fn()}
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

  it("should render with inconclusive multiplex values", () => {
    render(
      <TestResultInputForm
        queueItemId={"5d315d18-82f8-4025-a051-1a509e15c880"}
        covidResult="UNDETERMINED"
        fluAResult="UNDETERMINED"
        fluBResult="UNDETERMINED"
        supportsMultipleDiseases={true}
        onTestResultChange={jest.fn()}
        onSubmit={jest.fn()}
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
  });

  it("should pass back the result value when Flu A result clicked", async () => {
    const onChange = jest.fn();
    const onTestResultChange = jest.fn((_name: string) => onChange);
    render(
      <TestResultInputForm
        queueItemId={"5d315d18-82f8-4025-a051-1a509e15c880"}
        covidResult={undefined}
        fluAResult={undefined}
        fluBResult={undefined}
        supportsMultipleDiseases={true}
        onTestResultChange={onTestResultChange}
        onSubmit={jest.fn()}
      />
    );

    userEvent.click(screen.getAllByLabelText("Negative (-)")[1]);

    expect(onChange).toBeCalledWith("NEGATIVE");
  });

  it("should pass back the result value when Flu B result clicked", async () => {
    const onChange = jest.fn();
    const onTestResultChange = jest.fn((_name: string) => onChange);
    render(
      <TestResultInputForm
        queueItemId={"5d315d18-82f8-4025-a051-1a509e15c880"}
        covidResult={undefined}
        fluAResult={undefined}
        fluBResult={undefined}
        supportsMultipleDiseases={true}
        onTestResultChange={onTestResultChange}
        onSubmit={jest.fn()}
      />
    );

    userEvent.click(screen.getAllByLabelText("Negative (-)")[2]);

    expect(onChange).toBeCalledWith("NEGATIVE");
  });

  it("should not submit when there is no value for Flu A", () => {
    const onSubmit = jest.fn();
    render(
      <TestResultInputForm
        queueItemId={"5d315d18-82f8-4025-a051-1a509e15c880"}
        covidResult="POSITIVE"
        fluAResult={undefined}
        fluBResult="NEGATIVE"
        supportsMultipleDiseases={true}
        onTestResultChange={jest.fn()}
        onSubmit={onSubmit}
      />
    );

    userEvent.click(screen.getByText("Submit"));

    expect(onSubmit).toHaveBeenCalledTimes(0);
  });

  it("should not submit when there is no value for Flu B", () => {
    const onSubmit = jest.fn();
    render(
      <TestResultInputForm
        queueItemId={"5d315d18-82f8-4025-a051-1a509e15c880"}
        covidResult="POSITIVE"
        fluAResult="NEGATIVE"
        fluBResult={undefined}
        supportsMultipleDiseases={true}
        onTestResultChange={jest.fn()}
        onSubmit={onSubmit}
      />
    );

    userEvent.click(screen.getByText("Submit"));

    expect(onSubmit).toHaveBeenCalledTimes(0);
  });
});

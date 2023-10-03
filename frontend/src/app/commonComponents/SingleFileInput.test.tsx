import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SingleFileInput, { SingleFileInputProps } from "./SingleFileInput";

const file = (text: BlobPart) => {
  const blob = new Blob([text]);
  return new File([blob], "values.csv", { type: "text/csv" });
};

describe("Single File Input", () => {
  const handleOnChange = jest.fn();

  const renderWithUser = ({
    required,
    ariaInvalid,
    accept,
  }: Pick<SingleFileInputProps, "required" | "ariaInvalid" | "accept">) => ({
    user: userEvent.setup(),
    ...render(
      <SingleFileInput
        id="testId"
        name="testId"
        ariaLabel="upload a file"
        onChange={handleOnChange}
        required={required}
        ariaInvalid={ariaInvalid}
        accept={accept}
      />
    ),
  });

  it("checks component with initial state", () => {
    const { container } = renderWithUser({
      required: false,
      ariaInvalid: false,
      accept: undefined,
    });
    expect(container).toMatchSnapshot();
  });

  it("checks component state when file has been selected", async () => {
    const { user } = renderWithUser({
      required: false,
      ariaInvalid: false,
      accept: undefined,
    });
    const fileInput = screen.getByTestId("testId");
    await user.upload(fileInput, file("test content"));
    expect(
      await screen.findByText(
        "Drag file here or choose from folder to change file"
      )
    );
    expect(handleOnChange).toHaveBeenCalledTimes(1);
  });

  it("checks component state when file is unselected", async () => {
    renderWithUser({
      required: false,
      ariaInvalid: false,
      accept: undefined,
    });
    const fileInput = screen.getByTestId("testId");
    fireEvent.change(fileInput, { target: { files: { length: 0 } } });
    expect(await screen.findByText("Drag file here or choose from folder"));
  });

  it("checks component state when file type is valid", async () => {
    const { user } = renderWithUser({
      required: false,
      ariaInvalid: false,
      accept: undefined,
    });
    const fileInput = screen.getByTestId("testId");
    await user.upload(fileInput, file("test content"));
    expect(
      await screen.findByText(
        "Drag file here or choose from folder to change file"
      )
    );
  });
  it("checks component state when file type is not valid", async () => {
    renderWithUser({
      required: false,
      ariaInvalid: false,
      accept: ".csv, text/csv",
    });
    const fileInput = screen.getByTestId("testId");

    let file = new File(["(⌐□_□)"], "chucknorris.png", { type: "image/png" });
    fireEvent.change(fileInput, {
      target: { files: { item: jest.fn().mockReturnValue(file), length: 1 } },
    });
    expect(await screen.findByText(/This is not a valid file type/i));
    expect(await screen.findByTestId("testId")).toBeInvalid();
  });

  it("checks input component when aria invalid is true", async () => {
    renderWithUser({ required: false, ariaInvalid: true, accept: undefined });
    expect(await screen.findByTestId("testId")).toBeInvalid();
  });
});

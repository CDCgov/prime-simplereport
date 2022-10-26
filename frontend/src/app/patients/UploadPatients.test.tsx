import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import createMockStore from "redux-mock-store";
import { MemoryRouter } from "react-router-dom";
import React from "react";
import userEvent from "@testing-library/user-event";

import { file } from "../testResults/uploads/Uploads.test";
import { FileUploadService } from "../../fileUploadService/FileUploadService";

import UploadPatients from "./UploadPatients";

const mockStore = createMockStore([]);
const store = mockStore({
  facilities: [
    { id: "1", name: "Lincoln Middle School" },
    { id: "2", name: "Rosa Parks High School" },
    { id: "3", name: "Empty School" },
  ],
});
const renderUploadPatients = () =>
  render(
    <Provider store={store}>
      <MemoryRouter>
        <UploadPatients />
      </MemoryRouter>
    </Provider>
  );
const uploadPatientsSpy = (response: Response) =>
  jest.spyOn(FileUploadService, "uploadPatients").mockImplementation(() => {
    return Promise.resolve(response);
  });

describe("Upload Patient", () => {
  it("displays the upload patients page correctly", () => {
    const { container } = renderUploadPatients();
    expect(container).toMatchSnapshot();
  });
  it("should add facility name to label when facility is selected", async () => {
    renderUploadPatients();
    expect(
      await screen.findByText("3. Upload your spreadsheet.")
    ).toBeInTheDocument();
    userEvent.click(screen.getByText("One facility"));
    expect(await screen.findByText("Which facility?")).toBeInTheDocument();
    expect(
      await screen.findByText(
        "3. Upload your spreadsheet for Lincoln Middle School."
      )
    );
  });
  it("should disable submit button until both facility and file have values", async () => {
    renderUploadPatients();
    expect(await screen.findByText("Upload CSV file")).toBeDisabled();
    userEvent.click(screen.getByText("One facility"));
    expect(await screen.findByText("Upload CSV file")).toBeDisabled();
    const uploadFile = file("someText");
    const input = screen.getByTestId("file-input-input");
    userEvent.upload(input, uploadFile);
    expect(await screen.findByText("Upload CSV file")).toBeEnabled();
  });
  it("should disable submit button until both file and facility have values", async () => {
    renderUploadPatients();
    expect(await screen.findByText("Upload CSV file")).toBeDisabled();
    const uploadFile = file("someText");
    const input = screen.getByTestId("file-input-input");
    userEvent.upload(input, uploadFile);
    expect(await screen.findByText("Upload CSV file")).toBeDisabled();
    userEvent.click(screen.getByText("One facility"));
    expect(await screen.findByText("Upload CSV file")).toBeEnabled();
  });
  it("should show success message if upload is successful", async () => {
    renderUploadPatients();
    let mockResponse = new Response(null, {
      status: 200,
    });
    const uploadSpy = uploadPatientsSpy(mockResponse);
    const uploadFile = file("someText");
    const input = screen.getByTestId("file-input-input");
    userEvent.upload(input, uploadFile);
    userEvent.click(screen.getByText("All facilities"));
    userEvent.click(screen.getByText("Upload CSV file"));

    expect(uploadSpy).toHaveBeenCalledWith(uploadFile, "");
    expect(
      await screen.findByText("Success: File Accepted")
    ).toBeInTheDocument();
  });
  it("should show error message if upload fails", async () => {
    renderUploadPatients();
    let mockResponse = new Response(JSON.stringify({}), {
      status: 500,
    });
    const uploadSpy = uploadPatientsSpy(mockResponse);
    const uploadFile = file("someText");
    const input = screen.getByTestId("file-input-input");
    userEvent.upload(input, uploadFile);
    userEvent.click(screen.getByText("One facility"));
    userEvent.click(screen.getByText("Upload CSV file"));

    expect(uploadSpy).toHaveBeenCalledWith(uploadFile, "1");
    expect(
      await screen.findByText("Error: File not accepted")
    ).toBeInTheDocument();
  });
});

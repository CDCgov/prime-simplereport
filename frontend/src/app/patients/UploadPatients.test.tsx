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
const errorResponseBody = {
  status: "FAILURE",
  errors: [{ indices: [0], message: "bad zipcode" }],
};

const successResponseBody = {
  status: "SUCCESS",
  errors: null,
};

function userEventUpload(uploadFile: File, facility: string) {
  const input = screen.getByTestId("file-input-input");
  userEvent.upload(input, uploadFile);
  userEvent.click(screen.getByText(facility));
  userEvent.click(screen.getByText("Upload CSV file"));
}

const submitCSVFile = (
  mockResponse: Response,
  uploadFile = file("someText"),
  facility = "All facilities"
) => {
  let spy = uploadPatientsSpy(mockResponse);
  userEventUpload(uploadFile, facility);
  return spy;
};

describe("Upload Patient", () => {
  beforeEach(() => {});
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("displays the upload patients page correctly", () => {
    const { container } = renderUploadPatients();
    expect(container).toMatchSnapshot();
  });
  describe("facility selector", () => {
    it("should add facility name to label when one facility is selected", async () => {
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
    it("should remove facility name when all facilities is selected", async () => {
      renderUploadPatients();
      expect(
        await screen.findByText("3. Upload your spreadsheet.")
      ).toBeInTheDocument();
      userEvent.click(screen.getByText("One facility"));

      userEvent.click(screen.getByText("All facilities"));
      expect(
        await screen.findByText("3. Upload your spreadsheet.")
      ).toBeInTheDocument();
    });
  });
  describe("submit button should be disabled", () => {
    it("Until facility and file have values", async () => {
      renderUploadPatients();
      expect(await screen.findByText("Upload CSV file")).toBeDisabled();

      userEvent.click(screen.getByText("One facility"));
      expect(await screen.findByText("Upload CSV file")).toBeDisabled();
      const uploadFile = file("someText");
      const input = screen.getByTestId("file-input-input");
      userEvent.upload(input, uploadFile);

      expect(await screen.findByText("Upload CSV file")).toBeEnabled();
    });
    it("Until file and facility have values", async () => {
      renderUploadPatients();
      expect(await screen.findByText("Upload CSV file")).toBeDisabled();

      const uploadFile = file("someText");
      const input = screen.getByTestId("file-input-input");
      userEvent.upload(input, uploadFile);
      expect(await screen.findByText("Upload CSV file")).toBeDisabled();
      userEvent.click(screen.getByText("One facility"));

      expect(await screen.findByText("Upload CSV file")).toBeEnabled();
    });
  });
  it("should upload to single facility", async () => {
    renderUploadPatients();
    let mockResponse = new Response(JSON.stringify(successResponseBody), {
      status: 200,
    });
    const uploadFile = file("someText");

    const uploadSpy = submitCSVFile(mockResponse, uploadFile, "One facility");

    expect(uploadSpy).toHaveBeenCalledWith(uploadFile, "1");
    expect(
      await screen.findByText("Success: File Accepted")
    ).toBeInTheDocument();
  });
  it("should show success message if upload is successful", async () => {
    renderUploadPatients();
    let mockResponse = new Response(JSON.stringify(successResponseBody), {
      status: 200,
    });
    const uploadFile = file("someText");

    const uploadSpy = submitCSVFile(mockResponse, uploadFile);

    expect(uploadSpy).toHaveBeenCalledWith(uploadFile, "");
    expect(
      await screen.findByText("Success: File Accepted")
    ).toBeInTheDocument();
  });
  it("should show error message and list errors if error occurs", async () => {
    renderUploadPatients();
    let mockResponse = new Response(JSON.stringify(errorResponseBody), {
      status: 200,
    });

    submitCSVFile(mockResponse);

    expect(
      await screen.findByText("Error: File not accepted")
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        "Please resolve the errors below and upload your edited file."
      )
    ).toBeInTheDocument();
    expect(await screen.findByText("bad zipcode")).toBeInTheDocument();
    expect(await screen.findByText("Row(s): 0")).toBeInTheDocument();
  });
  it("should show error message if 500 is returned", async () => {
    renderUploadPatients();
    let mockResponse = new Response(null, {
      status: 500,
    });
    const uploadFile = file("someText");

    const uploadSpy = submitCSVFile(mockResponse, uploadFile);

    expect(uploadSpy).toHaveBeenCalledWith(uploadFile, "");
    expect(
      await screen.findByText("Error: File not accepted")
    ).toBeInTheDocument();
  });
  it("should close success message when close is clicked", async () => {
    renderUploadPatients();
    let mockResponse = new Response(JSON.stringify(successResponseBody), {
      status: 200,
    });
    uploadPatientsSpy(mockResponse);
    submitCSVFile(mockResponse);
    expect(
      await screen.findByText("Success: File Accepted")
    ).toBeInTheDocument();

    userEvent.click(screen.getByLabelText("close"));

    expect(
      screen.queryByText("Success: File Accepted")
    ).not.toBeInTheDocument();
  });
  it("should remove error message and table when close is clicked", async () => {
    renderUploadPatients();
    let mockResponse = new Response(JSON.stringify(errorResponseBody), {
      status: 200,
    });

    submitCSVFile(mockResponse);
    expect(
      await screen.findByText("Error: File not accepted")
    ).toBeInTheDocument();
    expect(await screen.findByText("bad zipcode")).toBeInTheDocument();

    userEvent.click(screen.getByLabelText("close"));
    expect(
      screen.queryByText("Error: File not accepted")
    ).not.toBeInTheDocument();
    expect(screen.queryByText("bad zipcode")).not.toBeInTheDocument();
  });
  it("should show loading message when file is being processed", async () => {
    renderUploadPatients();
    jest
      .spyOn(FileUploadService, "uploadPatients")
      .mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10000));
        return Promise.resolve(new Response());
      });

    userEventUpload(file("abc"), "All facilities");

    expect(
      await screen.findByText("Uploading patient information...")
    ).toBeInTheDocument();
  });
  it("should show error if empty file is provided", async () => {
    renderUploadPatients();

    userEventUpload(file(""), "All facilities");

    expect(screen.getByText("Invalid file")).toBeInTheDocument();
    expect(
      screen.queryByText("Uploading patient information...")
    ).not.toBeInTheDocument();
  });
  describe("handle file change", () => {
    it("should do nothing if no file was added", () => {
      renderUploadPatients();

      const input = screen.getByTestId("file-input-input");
      userEvent.upload(input, []);

      expect(screen.getByText("Drag file here or")).toBeInTheDocument();
    });
    it("shows the file when selected", () => {
      renderUploadPatients();

      const input = screen.getByTestId("file-input-input");
      userEvent.upload(input, file("someText"));

      expect(screen.getByText("Selected file")).toBeInTheDocument();
      expect(screen.getByText("values.csv")).toBeInTheDocument();
    });
  });
});

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
  user: {
    isAdmin: true,
  },
  facilities: [
    { id: "1", name: "Lincoln Middle School" },
    { id: "2", name: "Rosa Parks High School" },
    { id: "3", name: "Empty School" },
  ],
});
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useNavigate: () => mockNavigate,
  };
});

const renderUploadPatients = (isAdmin = true) =>
  render(
    <Provider store={store}>
      <MemoryRouter>
        <UploadPatients isAdmin={isAdmin} />
      </MemoryRouter>
    </Provider>
  );
const uploadPatientsSpy = (response: Response) =>
  jest.spyOn(FileUploadService, "uploadPatients").mockImplementation(() => {
    return Promise.resolve(response);
  });
const errorResponseBody = {
  status: "FAILURE",
  errors: [{ indices: [0, 1, 2], message: "bad zipcode" }],
};

const successResponseBody = {
  status: "SUCCESS",
  errors: null,
};

async function userEventUpload(uploadFile: File, facility: string) {
  const input = screen.getByTestId("upload-patients-file-input");
  await userEvent.upload(input, uploadFile);
  await userEvent.click(screen.getByText(facility));
  await userEvent.click(screen.getByText("Upload CSV file"));
}

const submitCSVFile = async (
  mockResponse: Response,
  uploadFile = file("someText"),
  facility = "All facilities"
) => {
  let spy = uploadPatientsSpy(mockResponse);
  await userEventUpload(uploadFile, facility);
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

      await userEvent.click(screen.getByText("One facility"));

      expect(await screen.findByText("Which facility?")).toBeInTheDocument();
      await userEvent.selectOptions(
        screen.getByRole("combobox", { name: /select facility/i }),
        "2"
      );
      expect(
        await screen.findByText(
          "3. Upload your spreadsheet for Rosa Parks High School."
        )
      );
    });
    it("should remove facility name when all facilities is selected", async () => {
      renderUploadPatients();
      expect(
        await screen.findByText("3. Upload your spreadsheet.")
      ).toBeInTheDocument();
      await userEvent.click(screen.getByText("One facility"));

      await userEvent.click(screen.getByText("All facilities"));
      expect(
        await screen.findByText("3. Upload your spreadsheet.")
      ).toBeInTheDocument();
    });
  });
  describe("submit button should be disabled", () => {
    it("Until facility and file have values", async () => {
      renderUploadPatients();
      expect(await screen.findByText("Upload CSV file")).toBeDisabled();

      await userEvent.click(screen.getByText("One facility"));
      expect(await screen.findByText("Upload CSV file")).toBeDisabled();
      const uploadFile = file("someText");
      const input = screen.getByTestId("upload-patients-file-input");
      await userEvent.upload(input, uploadFile);

      expect(await screen.findByText("Upload CSV file")).toBeEnabled();
    });
    it("Until file and facility have values", async () => {
      renderUploadPatients();
      expect(await screen.findByText("Upload CSV file")).toBeDisabled();

      const uploadFile = file("someText");
      const input = screen.getByTestId("upload-patients-file-input");
      await userEvent.upload(input, uploadFile);
      expect(await screen.findByText("Upload CSV file")).toBeDisabled();
      await userEvent.click(screen.getByText("One facility"));

      expect(await screen.findByText("Upload CSV file")).toBeEnabled();
    });
  });
  it("should upload to single facility", async () => {
    renderUploadPatients();
    let mockResponse = new Response(JSON.stringify(successResponseBody), {
      status: 200,
    });
    const uploadFile = file("someText");

    const uploadSpy = await submitCSVFile(
      mockResponse,
      uploadFile,
      "One facility"
    );

    expect(uploadSpy).toHaveBeenCalledWith(uploadFile, "1");
    expect(
      await screen.findByText("Success: Data confirmed")
    ).toBeInTheDocument();
  });
  it("should show success message if upload is successful", async () => {
    renderUploadPatients();
    let mockResponse = new Response(JSON.stringify(successResponseBody), {
      status: 200,
    });
    const uploadFile = file("someText");

    const uploadSpy = await submitCSVFile(mockResponse, uploadFile);

    expect(uploadSpy).toHaveBeenCalledWith(uploadFile, "");
    expect(
      await screen.findByText("Success: Data confirmed")
    ).toBeInTheDocument();
  });
  it("should show error message with a link to the patient bulk upload guide and list errors if error occurs", async () => {
    renderUploadPatients();
    let mockResponse = new Response(JSON.stringify(errorResponseBody), {
      status: 200,
    });

    await submitCSVFile(mockResponse);

    expect(
      await screen.findByText("Error: File not accepted")
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        "Please resolve the errors below and upload your edited file.",
        { exact: false }
      )
    ).toBeInTheDocument();
    expect(await screen.findByText("bad zipcode")).toBeInTheDocument();
    expect(await screen.findByText("Row(s): 0, 1, 2")).toBeInTheDocument();
  });

  it("should show error message and list errors even if error info is incomplete", async () => {
    const incompleteResponseBody = {
      status: "FAILURE",
      errors: [
        { indices: [0, 1, 2], message: "properly formed error" },
        { indices: [0, 1, 2, 3] },
        { message: "error with no indices" },
        {},
      ],
    };

    renderUploadPatients();

    let mockResponse = new Response(JSON.stringify(incompleteResponseBody), {
      status: 200,
    });

    submitCSVFile(mockResponse);

    expect(
      await screen.findByText("Error: File not accepted")
    ).toBeInTheDocument();

    expect(
      await screen.findByText(
        "Please resolve the errors below and upload your edited file.",
        { exact: false }
      )
    ).toBeInTheDocument();
    expect(
      await screen.findByText("properly formed error")
    ).toBeInTheDocument();
    expect(
      await screen.findByText("error with no indices")
    ).toBeInTheDocument();
    expect(await screen.findByText("Row(s): 0, 1, 2")).toBeInTheDocument();
    expect(await screen.findByText("Row(s): 0, 1, 2, 3")).toBeInTheDocument();

    const supportLinkText = "patient bulk upload guide";
    const supportLink = screen.getByText(supportLinkText).closest("a");
    if (supportLink === null) {
      throw Error(`Unable to find ${supportLink} link`);
    }
    expect(supportLink.href).toContain(
      "/using-simplereport/manage-people-you-test/bulk-upload-patients/#preparing-your-spreadsheet-data"
    );
  });
  it("should show error message if 500 is returned", async () => {
    renderUploadPatients();
    let mockResponse = new Response(null, {
      status: 500,
    });
    const uploadFile = file("someText");

    const uploadSpy = await submitCSVFile(mockResponse, uploadFile);

    expect(uploadSpy).toHaveBeenCalledWith(uploadFile, "");
    expect(
      await screen.findByText("Error: File not accepted")
    ).toBeInTheDocument();
  });
  it("should show error message if 200 but is a failure with no message", async () => {
    renderUploadPatients();

    let mockResponse = new Response(
      JSON.stringify({
        status: "FAILURE",
      }),
      {
        status: 200,
      }
    );
    const uploadFile = file("someText");

    const uploadSpy = await submitCSVFile(mockResponse, uploadFile);

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
    await submitCSVFile(mockResponse);
    expect(
      await screen.findByText("Success: Data confirmed")
    ).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText("close"));

    expect(
      screen.queryByText("Success: Data confirmed")
    ).not.toBeInTheDocument();
  });
  it("should remove error message and table when close is clicked", async () => {
    renderUploadPatients();
    let mockResponse = new Response(JSON.stringify(errorResponseBody), {
      status: 200,
    });

    await submitCSVFile(mockResponse);
    expect(
      await screen.findByText("Error: File not accepted")
    ).toBeInTheDocument();
    expect(await screen.findByText("bad zipcode")).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText("close"));
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

    await userEventUpload(file("abc"), "All facilities");

    expect(
      await screen.findByText("Uploading patient information...")
    ).toBeInTheDocument();
  });
  it("should show error if empty file is provided", async () => {
    renderUploadPatients();

    const errorResponseBody = {
      status: "FAILURE",
      errors: [
        {
          indices: [],
          message: "File is missing headers and other required data",
        },
      ],
    };
    let mockResponse = new Response(JSON.stringify(errorResponseBody), {
      status: 200,
    });
    await submitCSVFile(mockResponse);
    expect(
      await screen.findByText("Error: File not accepted")
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        "Please resolve the errors below and upload your edited file.",
        { exact: false }
      )
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        "File is missing headers and other required data",
        { exact: false }
      )
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Uploading patient information...")
    ).not.toBeInTheDocument();
  });
  describe("handle file change", () => {
    it("should do nothing if no file was added", async () => {
      renderUploadPatients();

      const input = screen.getByTestId("upload-patients-file-input");
      await userEvent.upload(input, []);
      expect(
        screen.getByRole("button", { name: /upload csv file/i })
      ).toBeDisabled();
      expect(
        screen.getByText("Drag file here or choose from folder")
      ).toBeInTheDocument();
      expect(
        screen.queryByText(
          "Drag file here or choose from folder to change file"
        )
      ).not.toBeInTheDocument();
    });
    it("shows the file when selected", async () => {
      renderUploadPatients();

      const input = screen.getByTestId("upload-patients-file-input");
      await userEvent.upload(input, file("someText"));
      expect(
        screen.getByText("Drag file here or choose from folder to change file")
      ).toBeInTheDocument();
    });
  });
  it("should redirect user if not admin", () => {
    renderUploadPatients(false);
    expect(mockNavigate).toHaveBeenCalledWith(`/queue`);
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });
});

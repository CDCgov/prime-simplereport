import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import createMockStore from "redux-mock-store";
import { MemoryRouter } from "react-router-dom";
import React from "react";
import userEvent, { UserEvent } from "@testing-library/user-event";

import { file } from "../utils/file";
import { FileUploadService } from "../../fileUploadService/FileUploadService";
import * as AppInsightsMock from "../TelemetryService";

import UploadPatients from "./UploadPatients";

const mockStore = createMockStore([]);
const store = mockStore({
  user: {
    isAdmin: false,
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

const renderUploadPatients = () => ({
  user: userEvent.setup(),
  ...render(
    <Provider store={store}>
      <MemoryRouter>
        <UploadPatients />
      </MemoryRouter>
    </Provider>
  ),
});

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

async function userEventUpload(
  user: UserEvent,
  uploadFile: File,
  facility: string
) {
  const input = screen.getByTestId("upload-patients-file-input");
  await user.upload(input, uploadFile);
  await user.click(screen.getByText(facility));
  await user.click(screen.getByText("Upload CSV file"));
}

const submitCSVFile = async (
  user: UserEvent,
  mockResponse: Response,
  uploadFile = file("someText"),
  facility = "All facilities"
) => {
  let spy = uploadPatientsSpy(mockResponse);
  await userEventUpload(user, uploadFile, facility);
  return spy;
};

describe("Upload Patient", () => {
  afterAll(() => {
    jest.clearAllMocks();
  });

  it("displays the upload patients page correctly", () => {
    const { container } = renderUploadPatients();
    expect(container).toMatchSnapshot();
  });
  describe("facility selector", () => {
    it("should add facility name to label when one facility is selected", async () => {
      const { user } = renderUploadPatients();
      expect(await screen.findByText("3. Upload your spreadsheet."));

      await user.click(screen.getByText("One facility"));

      expect(await screen.findByText("Which facility?")).toBeInTheDocument();

      await user.selectOptions(
        screen.getByRole("combobox", { name: /select facility/i }),
        "2"
      );
      expect(
        await screen.findByText(
          "3. Upload your spreadsheet for Rosa Parks High School."
        )
      ).toBeInTheDocument();
    });
    it("should remove facility name when all facilities is selected", async () => {
      const { user } = renderUploadPatients();
      expect(
        await screen.findByText("3. Upload your spreadsheet.")
      ).toBeInTheDocument();
      await user.click(screen.getByText("One facility"));

      await user.click(screen.getByText("All facilities"));
      expect(
        await screen.findByText("3. Upload your spreadsheet.")
      ).toBeInTheDocument();
    });
  });
  describe("submit button should be disabled", () => {
    it("Until facility and file have values", async () => {
      const { user } = renderUploadPatients();
      expect(await screen.findByText("Upload CSV file")).toBeDisabled();

      await user.click(screen.getByText("One facility"));
      expect(await screen.findByText("Upload CSV file")).toBeDisabled();
      const uploadFile = file("someText");
      const input = screen.getByTestId("upload-patients-file-input");
      await user.upload(input, uploadFile);

      expect(await screen.findByText("Upload CSV file")).toBeEnabled();
    });
    it("Until file and facility have values", async () => {
      const { user } = renderUploadPatients();
      expect(await screen.findByText("Upload CSV file")).toBeDisabled();

      const uploadFile = file("someText");
      const input = screen.getByTestId("upload-patients-file-input");
      await user.upload(input, uploadFile);
      expect(await screen.findByText("Upload CSV file")).toBeDisabled();
      await user.click(screen.getByText("One facility"));

      expect(await screen.findByText("Upload CSV file")).toBeEnabled();
    });
  });
  it("should upload to single facility", async () => {
    const { user } = renderUploadPatients();
    let mockResponse = new Response(JSON.stringify(successResponseBody), {
      status: 200,
    });
    const uploadFile = file("someText");

    const uploadSpy = await submitCSVFile(
      user,
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
    const { user } = renderUploadPatients();
    let mockResponse = new Response(JSON.stringify(successResponseBody), {
      status: 200,
    });
    const uploadFile = file("someText");

    const uploadSpy = await submitCSVFile(user, mockResponse, uploadFile);

    expect(uploadSpy).toHaveBeenCalledWith(uploadFile, "");
    expect(
      await screen.findByText("Success: Data confirmed")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Choose CSV file")).toHaveAttribute(
      "aria-invalid",
      "false"
    );
  });
  it("should show error message with a link to the patient bulk upload guide and list errors if error occurs", async () => {
    const { user } = renderUploadPatients();
    let mockResponse = new Response(JSON.stringify(errorResponseBody), {
      status: 200,
    });

    await submitCSVFile(user, mockResponse);

    expect(
      await screen.findByText("Error: File not accepted")
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Please resolve the errors below and", {
        exact: false,
      })
    ).toBeInTheDocument();
    expect(await screen.findByText("bad zipcode")).toBeInTheDocument();
    expect(await screen.findByText("Row(s): 0, 1, 2")).toBeInTheDocument();
    expect(screen.getByLabelText("Choose CSV file")).toHaveAttribute(
      "aria-invalid",
      "true"
    );
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

    const { user } = renderUploadPatients();

    let mockResponse = new Response(JSON.stringify(incompleteResponseBody), {
      status: 200,
    });

    await submitCSVFile(user, mockResponse);

    expect(
      await screen.findByText("Error: File not accepted")
    ).toBeInTheDocument();

    expect(
      await screen.findByText("Please resolve the errors below and", {
        exact: false,
      })
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
    expect(screen.getByLabelText("Choose CSV file")).toHaveAttribute(
      "aria-invalid",
      "true"
    );
  });
  it("should show error message if 500 is returned", async () => {
    const { user } = renderUploadPatients();
    let mockResponse = new Response(null, {
      status: 500,
    });
    const uploadFile = file("someText");

    const uploadSpy = await submitCSVFile(user, mockResponse, uploadFile);

    expect(uploadSpy).toHaveBeenCalledWith(uploadFile, "");
    expect(
      await screen.findByText("Error: File not accepted")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Choose CSV file")).toHaveAttribute(
      "aria-invalid",
      "true"
    );
  });
  it("should show error message if 200 but is a failure with no message", async () => {
    const { user } = renderUploadPatients();

    let mockResponse = new Response(
      JSON.stringify({
        status: "FAILURE",
      }),
      {
        status: 200,
      }
    );
    const uploadFile = file("someText");

    const uploadSpy = await submitCSVFile(user, mockResponse, uploadFile);

    expect(uploadSpy).toHaveBeenCalledWith(uploadFile, "");
    expect(
      await screen.findByText("Error: File not accepted")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Choose CSV file")).toHaveAttribute(
      "aria-invalid",
      "true"
    );
  });
  it("should show error for empty file", async () => {
    const { user } = renderUploadPatients();
    const emptyFile = file("");

    await userEventUpload(user, emptyFile, "One facility");
    expect(await screen.findByText("Error: Invalid file"));
    expect(screen.getByText("File is missing or empty.")).toBeInTheDocument();
    expect(screen.getByLabelText("Choose CSV file")).toHaveAttribute(
      "aria-invalid",
      "true"
    );
  });
  it("should show size error for large files", async () => {
    const { user } = renderUploadPatients();
    const tooBig = file("0".repeat(50 * 1000 * 1000 + 1));

    await userEventUpload(user, tooBig, "One facility");
    expect(
      await screen.findByText("Error: File too large")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "values.csv is too large for SimpleReport to process. Please limit each upload to less than 50 MB."
      )
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Choose CSV file")).toHaveAttribute(
      "aria-invalid",
      "true"
    );
  });
  it("should show size error for file with too many rows", async () => {
    const { user } = renderUploadPatients();
    const tooManyRows = file("\n".repeat(10001));

    await userEventUpload(user, tooManyRows, "One facility");
    expect(
      await screen.findByText("Error: File too large")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "values.csv has too many rows for SimpleReport to process. Please limit each upload to less than 10,000 rows."
      )
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Choose CSV file")).toHaveAttribute(
      "aria-invalid",
      "true"
    );
  });
  it("should close success message when close is clicked", async () => {
    const { user } = renderUploadPatients();
    let mockResponse = new Response(JSON.stringify(successResponseBody), {
      status: 200,
    });
    uploadPatientsSpy(mockResponse);
    await submitCSVFile(user, mockResponse);
    expect(
      await screen.findByText("Success: Data confirmed")
    ).toBeInTheDocument();

    await user.click(screen.getByLabelText("close"));

    expect(
      screen.queryByText("Success: Data confirmed")
    ).not.toBeInTheDocument();
  });
  it("should remove error message and table when close is clicked", async () => {
    const { user } = renderUploadPatients();
    let mockResponse = new Response(JSON.stringify(errorResponseBody), {
      status: 200,
    });

    await submitCSVFile(user, mockResponse);
    expect(
      await screen.findByText("Error: File not accepted")
    ).toBeInTheDocument();
    expect(await screen.findByText("bad zipcode")).toBeInTheDocument();

    await user.click(screen.getByLabelText("close"));
    expect(
      screen.queryByText("Error: File not accepted")
    ).not.toBeInTheDocument();
    expect(screen.queryByText("bad zipcode")).not.toBeInTheDocument();
  });
  it("should show loading message when file is being processed", async () => {
    const { user } = renderUploadPatients();
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
    jest
      .spyOn(FileUploadService, "uploadPatients")
      .mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return Promise.resolve(mockResponse);
      });

    await userEventUpload(user, file("abc"), "All facilities");

    expect(
      await screen.findByText("Uploading patient information...")
    ).toBeInTheDocument();

    expect(
      await screen.findByText("Error: File not accepted")
    ).toBeInTheDocument();
  });
  it("should show error if empty file is provided", async () => {
    const { user } = renderUploadPatients();

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
    await submitCSVFile(user, mockResponse);
    expect(
      await screen.findByText("Error: File not accepted")
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Please resolve the errors below and", {
        exact: false,
      })
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
    expect(screen.getByLabelText("Choose CSV file")).toHaveAttribute(
      "aria-invalid",
      "true"
    );
  });

  describe("handle file change", () => {
    it("should do nothing if no file was added", async () => {
      const { user } = renderUploadPatients();

      const input = screen.getByTestId("upload-patients-file-input");
      await user.upload(input, []);
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
      const { user } = renderUploadPatients();

      const input = screen.getByTestId("upload-patients-file-input");
      await user.upload(input, file("someText"));
      expect(
        screen.getByText("Drag file here or choose from folder to change file")
      ).toBeInTheDocument();
      expect(screen.getByLabelText("Choose CSV file")).toHaveAttribute(
        "aria-invalid",
        "false"
      );
    });
  });
  describe("telemetry", () => {
    const trackEventMock = jest.fn();
    const trackMetricMock = jest.fn();
    const trackExceptionMock = jest.fn();
    const getAppInsightsSpy = jest.spyOn(AppInsightsMock, "getAppInsights");
    beforeEach(() => {
      getAppInsightsSpy.mockImplementation(
        () =>
          ({
            trackEvent: trackEventMock,
            trackMetric: trackMetricMock,
            trackException: trackExceptionMock,
          } as jest.MockedObject<any>)
      );
    });

    afterEach(() => {
      getAppInsightsSpy.mockClear();
    });
    it("checks user click on guidelines gets tracked", async () => {
      const { user } = renderUploadPatients();

      await user.click(screen.getByText(/View patient bulk upload guide/i));
      await waitFor(() =>
        expect(trackEventMock).toHaveBeenCalledWith({
          name: "viewPatientBulkUploadGuide",
        })
      );
    });

    it("checks user download of csv sample gets tracked", async () => {
      const { user } = renderUploadPatients();

      await user.click(screen.getByText(/Download spreadsheet template/i));
      await waitFor(() =>
        expect(trackEventMock).toHaveBeenCalledWith({
          name: "downloadPatientBulkUploadSample",
        })
      );
    });
  });
});

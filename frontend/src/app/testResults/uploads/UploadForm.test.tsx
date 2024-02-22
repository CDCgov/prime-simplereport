import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import createMockStore from "redux-mock-store";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { ApplicationInsights } from "@microsoft/applicationinsights-web";
import React from "react";
import { MemoryRouter as Router } from "react-router";

import { file } from "../../utils/file";
import { getAppInsights } from "../../TelemetryService";
import { FileUploadService } from "../../../fileUploadService/FileUploadService";
import SRToastContainer from "../../commonComponents/SRToastContainer";

import UploadForm, {
  EnhancedFeedbackMessage,
  getErrorMessage,
  getGuidance,
  groupErrors,
} from "./UploadForm";

jest.mock("../../TelemetryService", () => ({
  ...jest.requireActual("../../TelemetryService"),
  getAppInsights: jest.fn(),
}));

const mockStore = createMockStore([]);
const store = mockStore({
  organization: {
    name: "Test Org",
  },
  user: {
    email: "testuser@test.org",
  },
});

const validFileContents =
  "Patient_last_name,Patient_first_name,Patient_middle_name,Patient_suffix,Patient_tribal_affiliation,Patient_ID,Ordered_test_code,Specimen_source_site_code,Specimen_type_code,Device_ID,Instrument_ID,Result_ID,Corrected_result_ID,Test_correction_reason,Test_result_status,Test_result_code,Illness_onset_date,Specimen_collection_date_time,Order_test_date,Test_date,Date_result_released,Patient_race,Patient_DOB,Patient_gender,Patient_ethnicity,Patient_preferred_language,Patient_street,Patient_street_2,Patient_city,Patient_state,Patient_zip_code,Patient_country,Patient_phone_number,Patient_county,Patient_email,Patient_role,Processing_mode_code,Employed_in_healthcare,Resident_congregate_setting,First_test,Symptomatic_for_disease,Testing_lab_name,Testing_lab_CLIA,Testing_lab_street,Testing_lab_street_2,Testing_lab_city,Testing_lab_state,Testing_lab_zip_code,Testing_lab_phone_number,Testing_lab_county,Organization_name,Ordering_facility_name,Ordering_facility_street,Ordering_facility_street_2,Ordering_facility_city,Ordering_facility_state,Ordering_facility_zip_code,Ordering_facility_phone_number,Ordering_facility_county,Ordering_provider_ID,Ordering_provider_last_name,Ordering_provider_first_name,Ordering_provider_street,Ordering_provider_street_2,Ordering_provider_city,Ordering_provider_state,Ordering_provider_zip_code,Ordering_provider_phone_number,Ordering_provider_county,Site_of_care\n" +
  "Alaska1,Judy,Suellen,,39,xen4p,94558-4,71836000,440500007,BD Veritor System for Rapid Detection of SARS-CoV-2,939273,Alaska1,613603,nh1rigems,F,260373001,20220225,202202201809-0500,202202261540-0500,20220221,20220220,2106-3,,F,H,Iloko,10269 Larry Villages,,Yellow jacket,AK,81335,USA,2853464789,Montezuma,lyndon.smitham@email.com,kgvmoxba,P,Y,UNK,N,Y,Any lab USA,BadCLIA,3279 Schroeder Mountain,,Yellow jacket,AK,81335,2365001476,Montezuma,see3r8,Any facility USA,35260 Dustin Crossroad,,Yellow jacket,AK,81335,2862149859,Montezuma,1368398388,Huels,Bradley,283 Runolfsson Drive,,Yellow jacket,AK,81335,2241497529,Montezuma,camp\n";

const validFile = () => file(validFileContents);

describe("Uploads", () => {
  const renderWithUser = () => ({
    user: userEvent.setup(),
    ...render(
      <Provider store={store}>
        <MemoryRouter>
          <SRToastContainer />
          <UploadForm
            uploadResults={FileUploadService.uploadResults}
            uploadType={"Disease Specific"}
            spreadsheetTemplateLocation={""}
            uploadGuideLocation={""}
          />
        </MemoryRouter>
      </Provider>
    ),
  });

  it("should render the upload screen", async () => {
    renderWithUser();

    expect(await screen.findByText("Upload your CSV")).toBeInTheDocument();
    expect(await screen.findByText(/Drag file here or/i)).toBeInTheDocument();
    expect(
      screen.queryByText("Your file has not been accepted.")
    ).not.toBeInTheDocument();
  });

  it("should display error toast when empty file is uploaded, button disabled", async () => {
    const { user } = renderWithUser();

    const emptyFile = file("");
    const input = screen.getByTestId("upload-csv-input");
    await user.upload(input, emptyFile);
    expect(
      await screen.findByText(
        "The file 'values.csv' doesn't contain any valid data. File should have a header line and at least one line of data."
      )
    ).toBeInTheDocument();
    expect(screen.getByTestId("button")).toBeDisabled();
    expect(screen.getByLabelText("Choose CSV file")).toHaveAttribute(
      "aria-invalid",
      "true"
    );
  });

  it("max row validation displays error message", async () => {
    const { user } = renderWithUser();
    const tooManyRows = file("\n".repeat(10001));

    const input = screen.getByTestId("upload-csv-input");
    await user.upload(input, tooManyRows);

    expect(
      await screen.findByText(
        "The file 'values.csv' has too many rows. The maximum number of rows is 10000."
      )
    ).toBeInTheDocument();
    expect(screen.getByTestId("button")).toBeDisabled();
    expect(screen.getByLabelText("Choose CSV file")).toHaveAttribute(
      "aria-invalid",
      "true"
    );
  });

  it("max bytes validation displays error message", async () => {
    const { user } = renderWithUser();
    const tooBig = file("0".repeat(50 * 1000 * 1000 + 1));

    const input = screen.getByTestId("upload-csv-input");
    await user.upload(input, tooBig);

    expect(
      await screen.findByText(
        "The file 'values.csv' is too large. The maximum file size is 48,828.13k"
      )
    ).toBeInTheDocument();
    expect(screen.getByTestId("button")).toBeDisabled();
    expect(screen.getByLabelText("Choose CSV file")).toHaveAttribute(
      "aria-invalid",
      "true"
    );
  });

  it("max item columns validation displays error message", async () => {
    const { user } = renderWithUser();
    const tooManyColumns = file("a, ".repeat(2001) + "\n");

    const input = screen.getByTestId("upload-csv-input");
    await user.upload(input, tooManyColumns);

    expect(
      await screen.findByText(
        "The file 'values.csv' has too many columns. The maximum number of allowed columns is 2000."
      )
    ).toBeInTheDocument();
    expect(screen.getByTestId("button")).toBeDisabled();
    expect(screen.getByLabelText("Choose CSV file")).toHaveAttribute(
      "aria-invalid",
      "true"
    );
  });

  describe("on file upload", () => {
    const mockTrackEvent = jest.fn();

    beforeEach(() => {
      (getAppInsights as jest.Mock).mockImplementation(() => {
        const ai = Object.create(ApplicationInsights.prototype);
        return Object.assign(ai, { trackEvent: mockTrackEvent });
      });
    });

    describe("happy path", () => {
      let file: File;
      let uploadResultsSpy: jest.SpyInstance<
        Promise<Response>,
        [csvFile: File]
      >;

      beforeEach(async () => {
        file = validFile();

        uploadResultsSpy = jest
          .spyOn(FileUploadService, "uploadResults")
          .mockImplementation(() => {
            return Promise.resolve(
              new Response(
                JSON.stringify([
                  {
                    reportId: "fake-report-id",
                    status: "FINISHED",
                    recordsCount: 1,
                    warnings: [],
                    errors: [],
                  },
                ]),
                { status: 200 }
              )
            );
          });

        const { user } = renderWithUser();

        const fileInput = screen.getByTestId("upload-csv-input");
        await user.upload(fileInput, file);

        expect(
          screen.getByText(
            "Drag file here or choose from folder to change file"
          )
        ).toBeInTheDocument();

        const submitButton = screen.getByTestId("button");
        await user.click(submitButton);
        await waitFor(() => {
          expect(
            screen.getByText("Success: File Accepted")
          ).toBeInTheDocument();
        });
      });

      it("performs HTTP request to rest endpoint to submit CSV file", async () => {
        expect(uploadResultsSpy).toHaveBeenCalled();
      });

      it("displays a success message and the returned Report ID", async () => {
        expect(screen.getByText("Confirmation Code")).toBeInTheDocument();
        expect(screen.getByText("fake-report-id")).toBeInTheDocument();
      });

      it("logs success event to App Insights", () => {
        expect(mockTrackEvent).toHaveBeenCalledWith({
          name: "Spreadsheet upload success",
          properties: {
            org: "Test Org",
            "report ID": "fake-report-id",
            user: "testuser@test.org",
            uploadType: "Disease Specific",
          },
        });
      });

      it("input should be valid", () => {
        expect(screen.getByLabelText("Choose CSV file")).toHaveAttribute(
          "aria-invalid",
          "false"
        );
      });
    });

    it("server upload failure displays error message", async () => {
      jest.spyOn(FileUploadService, "uploadResults").mockImplementation(() => {
        return Promise.resolve(new Response(null, { status: 500 }));
      });

      const { user } = renderWithUser();

      const fileInput = screen.getByTestId("upload-csv-input");
      await user.upload(fileInput, validFile());

      expect(
        screen.getByText("Drag file here or choose from folder to change file")
      ).toBeInTheDocument();

      const submitButton = screen.getByTestId("button");
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(
            "There was a server error. Your file has not been accepted."
          )
        ).toBeInTheDocument();
      });
      expect(
        screen.getByText(
          "There was a server error. Your file has not been accepted."
        ).parentElement?.parentElement
      ).toHaveFocus();
      expect(screen.queryByText("Requested Edit")).not.toBeInTheDocument();
      expect(mockTrackEvent).toHaveBeenCalledWith({
        name: "Spreadsheet upload server error",
        properties: {
          org: "Test Org",
          user: "testuser@test.org",
          uploadType: "Disease Specific",
        },
      });
    });

    it("response errors are shown to user", async () => {
      jest.spyOn(FileUploadService, "uploadResults").mockImplementation(() => {
        return Promise.resolve(
          new Response(
            JSON.stringify([
              {
                reportId: null,
                status: "ERROR",
                recordsCount: 1,
                warnings: [],
                errors: [
                  {
                    message: "missing required column",
                    scope: "report",
                  },
                ],
              },
            ]),
            { status: 200 }
          )
        );
      });

      const { user } = renderWithUser();

      const fileInput = screen.getByTestId("upload-csv-input");
      await user.upload(fileInput, validFile());
      expect(
        screen.getByText("Drag file here or choose from folder to change file")
      ).toBeInTheDocument();

      const submitButton = screen.getByTestId("button");
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Error: File not accepted")
        ).toBeInTheDocument();
      });
      expect(screen.getByText("Error")).toBeInTheDocument();
      expect(screen.getByText("Row(s)")).toBeInTheDocument();
      expect(screen.getByText("missing required column")).toBeInTheDocument();
      expect(mockTrackEvent).toHaveBeenCalledWith({
        name: "Spreadsheet upload validation failure",
        properties: {
          errors: [
            {
              message: "missing required column",
              scope: "report",
            },
          ],
          org: "Test Org",
          user: "testuser@test.org",
          uploadType: "Disease Specific",
        },
      });
    });
  });

  describe("error row grouping", () => {
    it("should group consecutive errors into a range with single values in between", () => {
      const errors = [
        { indices: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
        { indices: [1, 2, 3, 4, 6, 8, 9, 10] },
        { indices: [1, 2, 3, 10] },
        { indices: [5, 54, 56, 55] },
        { indices: [5, 66, 56] },
        { indices: [7] },
        { indices: [] },
        { indices: undefined },
      ] as EnhancedFeedbackMessage[];

      const result = groupErrors(errors);

      expect(result[0]?.indicesRange).toEqual(["1 - 10"]);
      expect(result[1]?.indicesRange).toEqual(["1 - 4", "6", "8 - 10"]);
      expect(result[2]?.indicesRange).toEqual(["1 - 3", "10"]);
      expect(result[3]?.indicesRange).toEqual(["5", "54 - 56"]);
      expect(result[4]?.indicesRange).toEqual(["5", "56", "66"]);
      expect(result[5]?.indicesRange).toEqual(["7"]);
      expect(result[6]?.indicesRange).toEqual(undefined);
      expect(result[7]?.indicesRange).toEqual(undefined);
    });
  });

  describe("error messages and guidance", () => {
    it("should give you guidance for missing headers", () => {
      const Guidance = getGuidance({
        errorType: "MISSING_HEADER",
        fieldHeader: "patient_first_name",
      } as EnhancedFeedbackMessage);

      render(<Router>{Guidance}</Router>);

      expect(screen.getByTestId("guidance")).toHaveTextContent(
        "Include a column with patient_first_name as the header."
      );
    });

    it("should give you guidance for missing data", () => {
      const Guidance = getGuidance({
        errorType: "MISSING_DATA",
        fieldHeader: "patient_first_name",
      } as EnhancedFeedbackMessage);

      render(<Router>{Guidance}</Router>);

      expect(screen.getByTestId("guidance")).toHaveTextContent(
        "patient_first_name is a required field. Include values in each row under this column."
      );
    });

    it("should give you guidance for required invalid data", () => {
      const Guidance = getGuidance({
        errorType: "INVALID_DATA",
        fieldHeader: "patient_first_name",
        fieldRequired: true,
      } as EnhancedFeedbackMessage) as JSX.Element;

      render(<Router>{Guidance}</Router>);

      expect(screen.getByTestId("guidance")).toHaveTextContent(
        "Follow the instructions under patient_first_name in the upload guide."
      );
      expect(screen.getByRole("link")).toHaveAttribute(
        "href",
        `/results/upload/submit/guide#patient_first_name`
      );
    });

    it("should give you guidance for unavailable disease", () => {
      const Guidance = getGuidance({
        errorType: "UNAVAILABLE_DISEASE",
        fieldHeader: "test_performed_code",
      } as EnhancedFeedbackMessage) as JSX.Element;

      render(<Router>{Guidance}</Router>);

      expect(screen.getByTestId("guidance")).toHaveTextContent(
        "The disease result on this row is not supported for your jursidiction. Double check test_performed_code or email support@simplereport.gov if you have questions"
      );
    });

    it("should give you guidance for optional invalid data", () => {
      const Guidance = getGuidance({
        errorType: "INVALID_DATA",
        fieldHeader: "patient_middle_name",
        fieldRequired: false,
      } as EnhancedFeedbackMessage) as JSX.Element;

      render(<Router>{Guidance}</Router>);

      expect(screen.getByTestId("guidance")).toHaveTextContent(
        "If including patient_middle_name, follow the instructions under patient_middle_name in the upload guide."
      );
      expect(screen.getByRole("link")).toHaveAttribute(
        "href",
        `/results/upload/submit/guide#patient_middle_name`
      );
    });

    it("should give you guidance for required invalid data with specific acceptable values", () => {
      const Guidance = getGuidance({
        errorType: "INVALID_DATA",
        fieldHeader: "patient_ethnicity",
        fieldRequired: true,
      } as EnhancedFeedbackMessage) as JSX.Element;

      render(<Router>{Guidance}</Router>);

      expect(screen.getByTestId("guidance")).toHaveTextContent(
        "Choose from the accepted values listed under patient_ethnicity in the upload guide."
      );
      expect(screen.getByRole("link")).toHaveAttribute(
        "href",
        `/results/upload/submit/guide#patient_ethnicity`
      );
    });

    it("should give you guidance for optional invalid data with specific acceptable values", () => {
      const Guidance = getGuidance({
        errorType: "INVALID_DATA",
        fieldHeader: "residence_type",
        fieldRequired: false,
      } as EnhancedFeedbackMessage) as JSX.Element;

      render(<Router>{Guidance}</Router>);

      expect(screen.getByTestId("guidance")).toHaveTextContent(
        "If including residence_type, choose from the accepted values listed under residence_type in the upload guide."
      );
      expect(screen.getByRole("link")).toHaveAttribute(
        "href",
        `/results/upload/submit/guide#residence_type`
      );
    });

    it("should highlight headers in error messages", () => {
      const ErrorMessage = getErrorMessage({
        message:
          "Invalid equipment_model_name and test_performed_code combination",
      } as EnhancedFeedbackMessage);

      render(<Router>{ErrorMessage}</Router>);

      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Invalid equipment_model_name and test_performed_code combination"
      );
      expect(screen.getAllByTestId("highlighted-header")).toHaveLength(2);
      expect(screen.getAllByTestId("highlighted-header")[0]).toHaveTextContent(
        "equipment_model_name"
      );
      expect(screen.getAllByTestId("highlighted-header")[1]).toHaveTextContent(
        "test_performed_code"
      );
    });

    it("should not highlight anything when no headers exist in error messages", () => {
      const ErrorMessage = getErrorMessage({
        message: "Invalid data",
      } as EnhancedFeedbackMessage);

      render(<Router>{ErrorMessage}</Router>);

      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Invalid data"
      );
      expect(
        screen.queryByTestId("highlighted-header")
      ).not.toBeInTheDocument();
    });
  });
});

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import createMockStore from "redux-mock-store";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";

import { FileUploadService } from "../../../fileUploadService/FileUploadService";
import SRToastContainer from "../../commonComponents/SRToastContainer";

import Uploads from "./Uploads";

const mockStore = createMockStore([]);
const store = mockStore({});

const validFileContents =
  "Patient_last_name,Patient_first_name,Patient_middle_name,Patient_suffix,Patient_tribal_affiliation,Patient_ID,Ordered_test_code,Specimen_source_site_code,Specimen_type_code,Device_ID,Instrument_ID,Result_ID,Corrected_result_ID,Test_correction_reason,Test_result_status,Test_result_code,Illness_onset_date,Specimen_collection_date_time,Order_test_date,Test_date,Date_result_released,Patient_race,Patient_DOB,Patient_gender,Patient_ethnicity,Patient_preferred_language,Patient_street,Patient_street_2,Patient_city,Patient_state,Patient_zip_code,Patient_country,Patient_phone_number,Patient_county,Patient_email,Patient_role,Processing_mode_code,Employed_in_healthcare,Resident_congregate_setting,First_test,Symptomatic_for_disease,Testing_lab_name,Testing_lab_CLIA,Testing_lab_street,Testing_lab_street_2,Testing_lab_city,Testing_lab_state,Testing_lab_zip_code,Testing_lab_phone_number,Testing_lab_county,Organization_name,Ordering_facility_name,Ordering_facility_street,Ordering_facility_street_2,Ordering_facility_city,Ordering_facility_state,Ordering_facility_zip_code,Ordering_facility_phone_number,Ordering_facility_county,Ordering_provider_ID,Ordering_provider_last_name,Ordering_provider_first_name,Ordering_provider_street,Ordering_provider_street_2,Ordering_provider_city,Ordering_provider_state,Ordering_provider_zip_code,Ordering_provider_phone_number,Ordering_provider_county,Site_of_care\n" +
  "Alaska1,Judy,Suellen,,39,xen4p,94558-4,71836000,440500007,BD Veritor System for Rapid Detection of SARS-CoV-2,939273,Alaska1,613603,nh1rigems,F,260373001,20220225,202202201809-0500,202202261540-0500,20220221,20220220,2106-3,,F,H,Iloko,10269 Larry Villages,,Yellow jacket,AK,81335,USA,2853464789,Montezuma,lyndon.smitham@email.com,kgvmoxba,P,Y,UNK,N,Y,Any lab USA,BadCLIA,3279 Schroeder Mountain,,Yellow jacket,AK,81335,2365001476,Montezuma,see3r8,Any facility USA,35260 Dustin Crossroad,,Yellow jacket,AK,81335,2862149859,Montezuma,1368398388,Huels,Bradley,283 Runolfsson Drive,,Yellow jacket,AK,81335,2241497529,Montezuma,camp\n";

const file = (text: BlobPart) => {
  const blob = new Blob([text]);
  const file = new File([blob], "values.csv", { type: "text/csv" });
  File.prototype.text = jest.fn().mockResolvedValueOnce(text);
  return file;
};

const validFile = () => file(validFileContents);

const TestContainer = () => (
  <Provider store={store}>
    <MemoryRouter>
      <SRToastContainer />
      <Uploads />
    </MemoryRouter>
  </Provider>
);

describe("Uploads", () => {
  it("should render the upload screen", async () => {
    render(<TestContainer />);

    expect(await screen.findByText("Upload your CSV")).toBeInTheDocument();
    expect(await screen.findByText("Drag file here or")).toBeInTheDocument();
  });

  it("should display error toast when empty file is uploaded, button disabled", async () => {
    render(<TestContainer />);

    const emptyFile = file("");
    const input = screen.getByTestId("file-input-input");
    userEvent.upload(input, emptyFile);
    expect(
      await screen.findByText(
        "The file 'values.csv' doesn't contain any valid data. File should have a header line and at least one line of data."
      )
    ).toBeInTheDocument();
    const button = screen.getByTestId("button");
    expect(button).toBeDisabled();
  });

  it("max row validation displays error message", async () => {
    render(<TestContainer />);
    const tooManyRows = file("\n".repeat(10001));

    const input = screen.getByTestId("file-input-input");
    userEvent.upload(input, tooManyRows);

    expect(
      await screen.findByText(
        "The file 'values.csv' has too many rows. The maximum number of rows is 10000."
      )
    ).toBeInTheDocument();
    const button = screen.getByTestId("button");
    expect(button).toBeDisabled();
  });

  it("max bytes validation displays error message", async () => {
    render(<TestContainer />);
    const tooBig = file("0".repeat(50 * 1000 * 1000 + 1));

    const input = screen.getByTestId("file-input-input");
    userEvent.upload(input, tooBig);

    expect(
      await screen.findByText(
        "The file 'values.csv' is too large. The maximum file size is 48,828.13k"
      )
    ).toBeInTheDocument();
    const button = screen.getByTestId("button");
    expect(button).toBeDisabled();
  });

  it("max item columns validation displays error message", async () => {
    render(<TestContainer />);
    const tooManyColumns = file("a, ".repeat(2001) + "\n");

    const input = screen.getByTestId("file-input-input");
    userEvent.upload(input, tooManyColumns);

    expect(
      await screen.findByText(
        "The file 'values.csv' has too many columns. The maximum number of allowed columns is 2000."
      )
    ).toBeInTheDocument();
    const button = screen.getByTestId("button");
    expect(button).toBeDisabled();
  });

  describe("happy path", () => {
    let file: File;
    let uploadResultsSpy: jest.SpyInstance<Promise<Response>, [csvFile: File]>;

    beforeEach(async () => {
      file = validFile();

      uploadResultsSpy = jest
        .spyOn(FileUploadService, "uploadResults")
        .mockImplementation(() => {
          return Promise.resolve(
            new Response(
              JSON.stringify({
                reportId: "fake-report-id",
                status: "FINISHED",
                recordsCount: 1,
                warnings: [],
                errors: [],
              }),
              { status: 200 }
            )
          );
        });

      await render(
        <Provider store={store}>
          <MemoryRouter>
            <SRToastContainer />
            <Uploads />
          </MemoryRouter>
        </Provider>
      );

      const fileInput = screen.getByTestId("file-input-input");
      userEvent.upload(fileInput, file);
      await waitFor(() => {
        screen.getByText("values.csv");
      });

      const submitButton = screen.getByTestId("button");
      userEvent.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText("Success: File Accepted")).toBeInTheDocument();
      });
    });

    it("performs HTTP request to rest endpoint to submit CSV file", async () => {
      expect(uploadResultsSpy).toHaveBeenCalled();
    });

    it("displays a success message and the returned Report ID", async () => {
      expect(screen.getByText("Confirmation Code")).toBeInTheDocument();
      expect(screen.getByText("fake-report-id")).toBeInTheDocument();
    });
  });
});

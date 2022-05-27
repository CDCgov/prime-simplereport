import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import createMockStore from "redux-mock-store";
import { MockedProvider, MockedProviderProps } from "@apollo/client/testing";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import { UploadTestResultCsvDocument } from "../../../generated/graphql";

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
  <MockedProvider>
    <Provider store={store}>
      <MemoryRouter>
        <ToastContainer />
        <Uploads />
      </MemoryRouter>
    </Provider>
  </MockedProvider>
);

describe("Uploads", () => {
  it("should render the upload screen", async () => {
    render(<TestContainer />);

    expect(await screen.findByText("COVID-19 CSV Uploads")).toBeInTheDocument();
    expect(
      await screen.findByText("Upload your COVID-19 lab results as a .csv.")
    ).toBeInTheDocument();
    expect(await screen.findByText("Drag file here or")).toBeInTheDocument();
  });

  it("should display error toast when empty file is uploaded", async () => {
    render(<TestContainer />);

    const emptyFile = file("");

    const input = screen.getByTestId("file-input-input");
    userEvent.upload(input, emptyFile);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    expect(
      await screen.findByText(
        "The file 'values.csv' doesn't contain any valid data. File should have a header line and at least one line of data."
      )
    ).toBeInTheDocument();
  });

  it("should disable button when empty file is selected", async () => {
    render(<TestContainer />);

    const emptyFile = file("");
    const input = screen.getByTestId("file-input-input");
    await userEvent.upload(input, emptyFile);
    const button = screen.getByTestId("button");

    expect(button).toBeDisabled();
  });

  describe("happy path", () => {
    let mockIsDone: boolean;
    let file: File;

    beforeEach(() => {
      mockIsDone = false;
      file = validFile();

      const mocks: MockedProviderProps["mocks"] = [
        {
          request: {
            query: UploadTestResultCsvDocument,
            variables: {
              testResultList: file,
            },
          },
          result: () => {
            mockIsDone = true;

            return {
              data: {
                uploadTestResultCSV: {
                  reportId: "fake-id",
                  status: "FINISHED",
                  recordsCount: 1,
                  warnings: [],
                  errors: [],
                },
              },
            };
          },
        },
      ];

      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <Provider store={store}>
            <MemoryRouter>
              <ToastContainer />
              <Uploads />
            </MemoryRouter>
          </Provider>
        </MockedProvider>
      );
    });

    it("performs HTTP request to submit CSV file, displays result", async () => {
      const input = screen.getByTestId("file-input-input");

      userEvent.upload(input, file);

      await new Promise((resolve) => setTimeout(resolve, 0));
      const button = screen.getByTestId("button");

      userEvent.click(button);

      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(mockIsDone).toEqual(true);
      expect(await screen.findByText("Success: File Accepted"));
      expect(await screen.findByText("fake-id"));
    });
  });
});

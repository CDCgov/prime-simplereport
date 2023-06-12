import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SingleFileInput from "./SingleFileInput";

const file = (text: BlobPart) => {
  const blob = new Blob([text]);
  return new File([blob], "values.csv", { type: "text/csv" });
};

describe("Single File Input", () => {
  const handleOnChange = jest.fn();

  /**
   * const validFileContents =
   *   "Patient_last_name,Patient_first_name,Patient_middle_name,Patient_suffix,Patient_tribal_affiliation,Patient_ID,Ordered_test_code,Specimen_source_site_code,Specimen_type_code,Device_ID,Instrument_ID,Result_ID,Corrected_result_ID,Test_correction_reason,Test_result_status,Test_result_code,Illness_onset_date,Specimen_collection_date_time,Order_test_date,Test_date,Date_result_released,Patient_race,Patient_DOB,Patient_gender,Patient_ethnicity,Patient_preferred_language,Patient_street,Patient_street_2,Patient_city,Patient_state,Patient_zip_code,Patient_country,Patient_phone_number,Patient_county,Patient_email,Patient_role,Processing_mode_code,Employed_in_healthcare,Resident_congregate_setting,First_test,Symptomatic_for_disease,Testing_lab_name,Testing_lab_CLIA,Testing_lab_street,Testing_lab_street_2,Testing_lab_city,Testing_lab_state,Testing_lab_zip_code,Testing_lab_phone_number,Testing_lab_county,Organization_name,Ordering_facility_name,Ordering_facility_street,Ordering_facility_street_2,Ordering_facility_city,Ordering_facility_state,Ordering_facility_zip_code,Ordering_facility_phone_number,Ordering_facility_county,Ordering_provider_ID,Ordering_provider_last_name,Ordering_provider_first_name,Ordering_provider_street,Ordering_provider_street_2,Ordering_provider_city,Ordering_provider_state,Ordering_provider_zip_code,Ordering_provider_phone_number,Ordering_provider_county,Site_of_care\n" +
   *   "Alaska1,Judy,Suellen,,39,xen4p,94558-4,71836000,440500007,BD Veritor System for Rapid Detection of SARS-CoV-2,939273,Alaska1,613603,nh1rigems,F,260373001,20220225,202202201809-0500,202202261540-0500,20220221,20220220,2106-3,,F,H,Iloko,10269 Larry Villages,,Yellow jacket,AK,81335,USA,2853464789,Montezuma,lyndon.smitham@email.com,kgvmoxba,P,Y,UNK,N,Y,Any lab USA,BadCLIA,3279 Schroeder Mountain,,Yellow jacket,AK,81335,2365001476,Montezuma,see3r8,Any facility USA,35260 Dustin Crossroad,,Yellow jacket,AK,81335,2862149859,Montezuma,1368398388,Huels,Bradley,283 Runolfsson Drive,,Yellow jacket,AK,81335,2241497529,Montezuma,camp\n";
   *
   * export const file = (text: BlobPart) => {
   *   const blob = new Blob([text]);
   *   const file = new File([blob], "values.csv", { type: "text/csv" });
   *   File.prototype.text = jest.fn().mockResolvedValueOnce(text);
   *   return file;
   * };
   *
   * const validFile = () => file(validFileContents);
   */

  it("checks component with initial state", () => {
    const { container } = render(
      <SingleFileInput
        id="testId"
        name="testId"
        ariaLabel="upload a file"
        onChange={handleOnChange}
        required={false}
        ariaInvalid={false}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it("checks component state when file has been selected", async () => {
    render(
      <SingleFileInput
        id="testId"
        name="testId"
        ariaLabel="upload a file"
        onChange={handleOnChange}
        required={false}
        ariaInvalid={false}
      />
    );
    const fileInput = screen.getByTestId("testId");
    await act(
      async () => await userEvent.upload(fileInput, file("test content"))
    );
    expect(
      await screen.findByText(
        "Drag file here or choose from folder to change file"
      )
    );
    expect(handleOnChange).toHaveBeenCalledTimes(1);
  });

  it("checks component state when file is unselected", async () => {
    render(
      <SingleFileInput
        id="testId"
        name="testId"
        ariaLabel="upload a file"
        onChange={handleOnChange}
        required={false}
      />
    );
    const fileInput = screen.getByTestId("testId");
    fireEvent.change(fileInput, { target: { files: { length: 0 } } });
    expect(await screen.findByText("Drag file here or choose from folder"));
  });

  it("checks component state when file type is valid", async () => {
    render(
      <SingleFileInput
        id="testId"
        name="testId"
        ariaLabel="upload a file"
        onChange={handleOnChange}
        required={false}
        accept=".csv, text/csv"
      />
    );
    const fileInput = screen.getByTestId("testId");
    await act(
      async () => await userEvent.upload(fileInput, file("test content"))
    );
    expect(
      await screen.findByText(
        "Drag file here or choose from folder to change file"
      )
    );
  });
  it("checks component state when file type is not valid", async () => {
    render(
      <SingleFileInput
        id="testId"
        name="testId"
        ariaLabel="upload a file"
        onChange={handleOnChange}
        required={true}
        accept=".csv, text/csv"
        ariaInvalid={false}
      />
    );
    const fileInput = screen.getByTestId("testId");

    let file = new File(["(⌐□_□)"], "chucknorris.png", { type: "image/png" });

    fireEvent.change(fileInput, {
      target: { files: { item: jest.fn().mockReturnValue(file), length: 1 } },
    });
    expect(await screen.findByText(/This is not a valid file type/i));
    expect(await screen.findByTestId("testId")).toBeInvalid();
  });
  it("checks input component when aria invalid is true", async () => {
    render(
      <SingleFileInput
        id="testId"
        name="testId"
        ariaLabel="upload a file"
        onChange={handleOnChange}
        required={true}
        accept=".csv, text/csv"
        ariaInvalid={true}
      />
    );
    expect(await screen.findByTestId("testId")).toBeInvalid();
  });
});

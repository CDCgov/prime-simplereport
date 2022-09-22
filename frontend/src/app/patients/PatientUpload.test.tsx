import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { FileUploadService } from "../../fileUploadService/FileUploadService";
import * as utils from "../utils/index";
import Alert from "../commonComponents/Alert";

import PatientUpload from "./PatientUpload";

describe("Patient Upload", () => {
  const csvFile = new File(["foo"], "patients.csv");
  const onSuccessCallback = jest.fn();
  let alertSpy: jest.SpyInstance;
  let uploadPatientsResponse: () => Response;

  beforeEach(() => {
    alertSpy = jest.spyOn(utils, "showNotification");
    jest.spyOn(FileUploadService, "uploadPatients").mockImplementation(() => {
      return Promise.resolve(uploadPatientsResponse());
    });

    render(<PatientUpload onSuccess={onSuccessCallback} />);
  });

  describe("when successful", () => {
    it("should upload the csv file and show message", async () => {
      //Given
      uploadPatientsResponse = () =>
        new Response("Successfully uploaded 1 record(s)", { status: 200 });
      const fileInput = screen.getByTestId("patient-file-input");

      //When
      userEvent.upload(fileInput, csvFile);

      //Then
      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          <Alert
            body="Successfully uploaded 1 record(s)"
            title="Patients uploaded"
            type="success"
          />
        );
      });

      expect(onSuccessCallback).toHaveBeenCalled();
    });
  });

  describe("when failure", () => {
    it("should show error message", async () => {
      //Given
      uploadPatientsResponse = () =>
        new Response("Invalid csv", { status: 400 });
      const fileInput = screen.getByTestId("patient-file-input");

      //When
      userEvent.upload(fileInput, csvFile);

      //Then
      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          <Alert body="Invalid csv" title="error" type="error" />
        );
      });
      expect(onSuccessCallback).not.toHaveBeenCalled();
    });
  });
});

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import createMockStore from "redux-mock-store";
import { Provider } from "react-redux";
import { MemoryRouter as Router } from "react-router-dom";

import { FileUploadService } from "../../fileUploadService/FileUploadService";
import * as srToast from "../utils/srToast";

import PatientUpload from "./PatientUpload";

const mockStore = createMockStore([]);

const store = mockStore({
  facilities: [
    { id: "1", name: "Facility 1" },
    { id: "2", name: "Facility 2" },
  ],
});

const csvFile = new File(["foo"], "patients.csv");
const onSuccessCallback = jest.fn();
let alertSpy: jest.SpyInstance;
let uploadSpy: jest.SpyInstance;
let uploadPatientsResponse: () => Response;

const setup = (toastAlertTypeFn: "showError" | "showSuccess") => {
  alertSpy = jest.spyOn(srToast, toastAlertTypeFn);
  uploadSpy = jest
    .spyOn(FileUploadService, "uploadPatients")
    .mockImplementation(() => {
      return Promise.resolve(uploadPatientsResponse());
    });
  render(
    <Router
      initialEntries={[{ pathname: "/", search: "?facility=1" }]}
      initialIndex={0}
    >
      <Provider store={store}>
        <PatientUpload onSuccess={onSuccessCallback} />
      </Provider>
    </Router>
  );
};

describe("When successful patient upload", () => {
  it("should upload the csv file and show success message", async () => {
    setup("showSuccess");

    //Given
    uploadPatientsResponse = () =>
      new Response("Successfully uploaded 1 record(s)", { status: 200 });
    const fileInput = screen.getByTestId("patient-file-input");

    //When
    userEvent.upload(fileInput, csvFile);

    //Then
    expect(uploadSpy).toHaveBeenCalledWith(csvFile, "");
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "Successfully uploaded 1 record(s)",
        "Patients uploaded"
      );
    });
    expect(onSuccessCallback).toHaveBeenCalled();
  });

  it("should send request with facility id if requested", async () => {
    setup("showSuccess");

    // Given
    uploadPatientsResponse = () =>
      new Response("Successfully uploaded 1 record(s)", { status: 200 });
    const fileInput = screen.getByTestId("patient-file-input");

    //When
    userEvent.click(
      screen.getByLabelText("Upload patients only to current facility", {
        exact: false,
      })
    );
    userEvent.upload(fileInput, csvFile);

    // Then
    expect(uploadSpy).toHaveBeenCalledWith(csvFile, "1");
  });
});

describe("When failed patient upload", () => {
  it("should show error message", async () => {
    setup("showError");

    //Given
    uploadPatientsResponse = () => new Response("Invalid csv", { status: 400 });
    const fileInput = screen.getByTestId("patient-file-input");

    //When
    userEvent.upload(fileInput, csvFile);

    //Then
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Invalid csv", "Error");
    });
    expect(onSuccessCallback).not.toHaveBeenCalled();
  });
});

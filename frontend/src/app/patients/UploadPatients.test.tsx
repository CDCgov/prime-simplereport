import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import createMockStore from "redux-mock-store";
import { MemoryRouter } from "react-router-dom";
import React from "react";
import userEvent from "@testing-library/user-event";

import { file } from "../testResults/uploads/Uploads.test";

import UploadPatients from "./UploadPatients";

const mockStore = createMockStore([]);
const store = mockStore({
  facilities: [
    { id: "1", name: "Lincoln Middle School" },
    { id: "2", name: "Rosa Parks High School" },
    { id: "3", name: "Empty School" },
  ],
});

describe("Upload Patient", () => {
  it("should add facility name to label when facility is selected", async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <UploadPatients />
        </MemoryRouter>
      </Provider>
    );
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
    render(
      <Provider store={store}>
        <MemoryRouter>
          <UploadPatients />
        </MemoryRouter>
      </Provider>
    );
    expect(await screen.findByText("Upload CSV file")).toBeDisabled();
    userEvent.click(screen.getByText("One facility"));
    expect(await screen.findByText("Upload CSV file")).toBeDisabled();
    const uploadFile = file("someText");
    const input = screen.getByTestId("file-input-input");
    userEvent.upload(input, uploadFile);
    expect(await screen.findByText("Upload CSV file")).toBeEnabled();
  });
  it("should disable submit button until both file and facility have values", async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <UploadPatients />
        </MemoryRouter>
      </Provider>
    );
    expect(await screen.findByText("Upload CSV file")).toBeDisabled();
    const uploadFile = file("someText");
    const input = screen.getByTestId("file-input-input");
    userEvent.upload(input, uploadFile);
    expect(await screen.findByText("Upload CSV file")).toBeDisabled();
    userEvent.click(screen.getByText("One facility"));
    expect(await screen.findByText("Upload CSV file")).toBeEnabled();
  });
});

import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { v4 as uuid } from "uuid";

import "../../i18n";

import { PxpApi } from "../PxpApiService";

import DOB from "./DOB";

const mockStore = configureStore([]);
const mockContainer = (store: any) => (
  <Provider store={store}>
    <DOB />
  </Provider>
);

const validateDateOfBirthSpy = jest
  .spyOn(PxpApi, "validateDateOfBirth")
  .mockImplementation(jest.fn());

describe("DOB (valid UUID)", () => {
  beforeEach(() => {
    const store = mockStore({
      plid: uuid(),
    });
    render(mockContainer(store));
  });

  it("Checks for the correct format - dashes aren't accepted", async () => {
    // GIVEN
    userEvent.type(await screen.findByLabelText("Date of birth"), "07-12-1987");
    userEvent.click(await screen.findByText("Continue"));

    // WHEN
    const error = await screen.findByRole("alert");

    // THEN
    expect(error).toHaveTextContent(
      "Error: Date of birth must be in MM/DD/YYYY format"
    );
    expect(validateDateOfBirthSpy).not.toHaveBeenCalled();
  });

  it("Checks for the correct format - missing slashes aren't accepted", async () => {
    // GIVEN
    userEvent.type(await screen.findByLabelText("Date of birth"), "07121987");
    userEvent.click(await screen.findByText("Continue"));

    // WHEN
    const error = await screen.findByRole("alert");

    // THEN
    expect(error).toHaveTextContent(
      "Error: Date of birth must be in MM/DD/YYYY format"
    );
    expect(validateDateOfBirthSpy).not.toHaveBeenCalled();
  });

  it("Checks to make sure it is actually a possible date", async () => {
    // GIVEN
    userEvent.type(await screen.findByLabelText("Date of birth"), "99/99/9999");
    userEvent.click(await screen.findByText("Continue"));

    // WHEN
    const error = await screen.findByRole("alert");

    // THEN
    expect(error).toHaveTextContent(
      "Error: Date of birth must be a valid date"
    );
    expect(validateDateOfBirthSpy).not.toHaveBeenCalled();
  });

  it("Checks to make sure it is a date after 1900", async () => {
    // GIVEN
    userEvent.type(await screen.findByLabelText("Date of birth"), "08/21/1899");
    userEvent.click(await screen.findByText("Continue"));

    // WHEN
    const error = await screen.findByRole("alert");

    // THEN
    expect(error).toHaveTextContent(
      "Error: Date of birth must be after 1900 and before the current year"
    );
    expect(validateDateOfBirthSpy).not.toHaveBeenCalled();
  });

  it("Checks to make sure it is a date before this year", async () => {
    // GIVEN
    userEvent.type(await screen.findByLabelText("Date of birth"), "08/21/2237");
    userEvent.click(await screen.findByText("Continue"));

    // WHEN
    const error = await screen.findByRole("alert");

    // THEN
    expect(error).toHaveTextContent(
      "Error: Date of birth must be after 1900 and before the current year"
    );
    expect(validateDateOfBirthSpy).not.toHaveBeenCalled();
  });

  it("Rejects the wrong date (not what is stored for the user)", async () => {
    // GIVEN
    validateDateOfBirthSpy.mockRejectedValue({ status: 403 });
    userEvent.type(await screen.findByLabelText("Date of birth"), "08/22/1987");
    userEvent.click(await screen.findByText("Continue"));

    // WHEN
    const error = await screen.findByRole("alert");

    // THEN
    expect(error).toHaveTextContent(
      "Error: The date of birth entered is incorrect"
    );
    expect(validateDateOfBirthSpy).toHaveBeenCalled();
  });

  it("Accepts an otherwise valid date", async () => {
    // GIVEN
    userEvent.type(await screen.findByLabelText("Date of birth"), "08/21/1987");

    // WHEN
    userEvent.click(await screen.findByText("Continue"));
    await waitForElementToBeRemoved(() =>
      screen.queryByText("Validating birth date...")
    );

    // THEN
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("Rejects an expired link", async () => {
    // GIVEN
    validateDateOfBirthSpy.mockRejectedValue({ status: 410 });
    userEvent.type(await screen.findByLabelText("Date of birth"), "08/21/1987");

    // WHEN
    userEvent.click(await screen.findByText("Continue"));
    await waitForElementToBeRemoved(() =>
      screen.queryByText("Validating birth date...")
    );

    // THEN
    expect(
      await screen.findByText(
        "This link has expired. Please contact your test provider to generate a new link.",
        { exact: false }
      )
    ).toBeInTheDocument();
    expect(validateDateOfBirthSpy).toHaveBeenCalled();
  });

  it("Rejects an invalid link", async () => {
    // GIVEN
    validateDateOfBirthSpy.mockRejectedValue({ status: 404 });
    userEvent.type(await screen.findByLabelText("Date of birth"), "08/21/1987");

    // WHEN
    userEvent.click(await screen.findByText("Continue"));
    await waitForElementToBeRemoved(() =>
      screen.queryByText("Validating birth date...")
    );

    // THEN
    expect(
      await screen.findByText(
        "This test result link is invalid. Please double check the URL or contact your test provider for the correct link.",
        { exact: false }
      )
    ).toBeInTheDocument();
    expect(validateDateOfBirthSpy).toHaveBeenCalled();
  });
});

describe("DOB (invalid UUID)", () => {
  it("Rejects an invalid UUID without calling the API", async () => {
    // GIVEN
    const store = mockStore({
      plid: "this is totally not a valid UUID",
    });
    render(mockContainer(store));

    // WHEN
    const error = await screen.findByRole("alert");

    // THEN
    expect(error).toHaveTextContent(
      "Page not foundThis test result link is invalid. Please double check the URL or contact your test provider for the correct link."
    );
    expect(validateDateOfBirthSpy).not.toHaveBeenCalled();
  });
});

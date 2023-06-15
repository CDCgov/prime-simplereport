import {
  act,
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

const plid = uuid();
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
  let getTestResultUnauthenticatedSpy: jest.SpyInstance;

  beforeEach(async () => {
    const store = mockStore({ plid });

    getTestResultUnauthenticatedSpy = jest
      .spyOn(PxpApi, "getTestResultUnauthenticated")
      .mockImplementation((_plid) => {
        return new Promise((res) =>
          setTimeout(
            () =>
              res({
                patient: {
                  firstName: "John",
                  lastName: "D.",
                },
                facility: {
                  name: "Testing Facility",
                  phone: "6318675309",
                },
                expiresAt: new Date("3000-01-01"),
              }),
            300
          )
        );
      });

    render(mockContainer(store));
    expect(await screen.findByText("John D.'s")).toBeInTheDocument();
  });

  it("fetches unauthenticated test result data from server on render", async () => {
    expect(getTestResultUnauthenticatedSpy).toBeCalledWith(plid);
  });

  it("shows obfuscated patient name on verification screen", async () => {
    // Text is broken up by multiple HTML elements
    expect(await screen.findByText("John D.'s")).toBeInTheDocument();
    expect(
      await screen.findByText(
        "date of birth to access their COVID-19 test result.",
        { exact: false }
      )
    ).toBeInTheDocument();
  });

  it("shows facility name and phone number on verification screen", async () => {
    expect(
      await screen.findByText("Testing Facility", { exact: false })
    ).toBeInTheDocument();
    expect(
      await screen.findByText("(631) 867-5309", { exact: false })
    ).toBeInTheDocument();
  });

  it("shows patient link expiration date on verification screen", async () => {
    expect(
      await screen.findByText("Note: this link will expire on ", {
        exact: false,
      })
    ).toBeInTheDocument();
    expect(
      await screen.findByText("January 1, 3000 at 12:00 am", { exact: false })
    ).toBeInTheDocument();
  });

  it("Checks to make sure it is actually a possible date", async () => {
    // GIVEN
    await act(
      async () =>
        await userEvent.type(await screen.findByLabelText("Month"), "2")
    );
    await act(
      async () =>
        await userEvent.type(await screen.findByLabelText("Day"), "31")
    );
    await act(
      async () =>
        await userEvent.type(await screen.findByLabelText("Year"), "1990")
    );
    await act(
      async () => await userEvent.click(await screen.findByText("Continue"))
    );

    // WHEN
    const error = await screen.findByRole("alert");

    // THEN
    expect(error).toHaveTextContent(
      "Error: Date of birth must be a valid date"
    );
    expect(await screen.findByLabelText("Day")).toHaveFocus();
    expect(validateDateOfBirthSpy).not.toHaveBeenCalled();
  });

  it("Does not allow partial dates", async () => {
    // GIVEN
    await act(
      async () =>
        await userEvent.type(await screen.findByLabelText("Month"), "7")
    );
    await act(
      async () =>
        await userEvent.type(await screen.findByLabelText("Day"), "31")
    );
    await act(
      async () => await userEvent.click(await screen.findByText("Continue"))
    );

    // WHEN
    const error = await screen.findByRole("alert");

    // THEN
    expect(error).toHaveTextContent(
      "Error: Date of birth must be a valid date"
    );
    expect(await screen.findByLabelText("Year")).toHaveFocus();
    expect(validateDateOfBirthSpy).not.toHaveBeenCalled();
  });

  it("Checks to make sure it is a date after 1900", async () => {
    // GIVEN
    await act(
      async () =>
        await userEvent.type(await screen.findByLabelText("Month"), "08")
    );
    await act(
      async () =>
        await userEvent.type(await screen.findByLabelText("Day"), "21")
    );
    await act(
      async () =>
        await userEvent.type(await screen.findByLabelText("Year"), "1899")
    );
    await act(
      async () => await userEvent.click(await screen.findByText("Continue"))
    );

    // WHEN
    const error = await screen.findByRole("alert");

    // THEN
    expect(error).toHaveTextContent(
      "Error: Date of birth must be after 1900 and before the current year"
    );
    expect(await screen.findByLabelText("Year")).toHaveFocus();
    expect(validateDateOfBirthSpy).not.toHaveBeenCalled();
  });

  it("Checks to make sure it is a date before this year", async () => {
    // GIVEN
    await act(
      async () =>
        await userEvent.type(await screen.findByLabelText("Month"), "08")
    );
    await act(
      async () =>
        await userEvent.type(await screen.findByLabelText("Day"), "21")
    );
    await act(
      async () =>
        await userEvent.type(await screen.findByLabelText("Year"), "2237")
    );
    await act(
      async () => await userEvent.click(await screen.findByText("Continue"))
    );

    // WHEN
    const error = await screen.findByRole("alert");

    // THEN
    expect(error).toHaveTextContent(
      "Error: Date of birth must be after 1900 and before the current year"
    );
    expect(await screen.findByLabelText("Year")).toHaveFocus();
    expect(validateDateOfBirthSpy).not.toHaveBeenCalled();
  });

  it("Rejects the wrong date (not what is stored for the user)", async () => {
    // GIVEN
    validateDateOfBirthSpy.mockRejectedValue({ status: 403 });
    await act(
      async () =>
        await userEvent.type(await screen.findByLabelText("Month"), "08")
    );
    await act(
      async () =>
        await userEvent.type(await screen.findByLabelText("Day"), "22")
    );
    await act(
      async () =>
        await userEvent.type(await screen.findByLabelText("Year"), "1987")
    );
    await act(
      async () => await userEvent.click(await screen.findByText("Continue"))
    );

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
    validateDateOfBirthSpy.mockImplementation(
      () => new Promise((res) => setTimeout(() => res({} as any), 300))
    );
    await act(
      async () =>
        await userEvent.type(await screen.findByLabelText("Month"), "08")
    );
    await act(
      async () =>
        await userEvent.type(await screen.findByLabelText("Day"), "21")
    );
    await act(
      async () =>
        await userEvent.type(await screen.findByLabelText("Year"), "1987")
    );

    // WHEN
    await act(
      async () => await userEvent.click(await screen.findByText("Continue"))
    );
    await waitForElementToBeRemoved(() =>
      screen.queryByText("Validating birth date...")
    );

    // THEN
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("Rejects an expired link", async () => {
    // GIVEN
    validateDateOfBirthSpy.mockImplementation(
      () =>
        new Promise((res, rej) => setTimeout(() => rej({ status: 410 }), 300))
    );
    await act(
      async () =>
        await userEvent.type(await screen.findByLabelText("Month"), "08")
    );
    await act(
      async () =>
        await userEvent.type(await screen.findByLabelText("Day"), "21")
    );
    await act(
      async () =>
        await userEvent.type(await screen.findByLabelText("Year"), "1987")
    );

    // WHEN
    await act(
      async () => await userEvent.click(await screen.findByText("Continue"))
    );
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
    validateDateOfBirthSpy.mockImplementation(
      () =>
        new Promise((res, rej) => setTimeout(() => rej({ status: 404 }), 300))
    );
    await act(
      async () =>
        await userEvent.type(await screen.findByLabelText("Month"), "08")
    );
    await act(
      async () =>
        await userEvent.type(await screen.findByLabelText("Day"), "21")
    );
    await act(
      async () =>
        await userEvent.type(await screen.findByLabelText("Year"), "1987")
    );

    // WHEN
    await act(
      async () => await userEvent.click(await screen.findByText("Continue"))
    );
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
    jest
      .spyOn(PxpApi, "getTestResultUnauthenticated")
      .mockImplementation((_plid) => {
        return new Promise((res) =>
          setTimeout(
            () =>
              res({
                patient: {
                  firstName: "John",
                  lastName: "D.",
                },
                facility: {
                  name: "Testing Facility",
                  phone: "6318675309",
                },
                expiresAt: new Date("3000-01-01"),
              }),
            300
          )
        );
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

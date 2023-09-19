import { configureAxe } from "jest-axe";
import { render } from "@testing-library/react";
import createMockStore from "redux-mock-store";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import React from "react";

import SRToastContainer from "../../commonComponents/SRToastContainer";

import DiseaseSpecificUploadContainer from "./DiseaseSpecificUploadContainer";

const mockStore = createMockStore([]);
const store = mockStore();
const axe = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    region: { enabled: false },
  },
});

describe("Disease specific upload container test", () => {
  it("passes axe tests", async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <SRToastContainer />
          <DiseaseSpecificUploadContainer />
        </MemoryRouter>
      </Provider>
    );
    expect(await axe(document.body)).toHaveNoViolations();
    expect(document.body).toMatchSnapshot();
  });
});

import React from "react";
import Header from "./commonComponents/Header";
import Banner from "./commonComponents/Banner";

function App() {
  return (
    <div className="App">
      <Banner />
      <Header />
      <form className="usa-form">
        <fieldset className="usa-fieldset">
          <legend className="usa-legend usa-legend">
            Select one historical figure
          </legend>
          <div className="usa-radio">
            <input
              className="usa-radio__input"
              id="historical-truth"
              type="radio"
              name="historical-figures"
              value="sojourner-truth"
            />
            <label className="usa-radio__label" htmlFor="historical-truth">
              Sojourner Truth
            </label>
          </div>

          <div className="usa-radio">
            <input
              className="usa-radio__input"
              id="historical-carver"
              type="radio"
              name="historical-figures"
              value="george-washington-carver"
              disabled
            />
            <label className="usa-radio__label" htmlFor="historical-carver">
              George Washington Carver
            </label>
          </div>
        </fieldset>
      </form>
    </div>
  );
}

export default App;

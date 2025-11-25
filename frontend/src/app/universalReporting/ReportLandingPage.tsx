import { Button } from "@trussworks/react-uswds";

import { LinkWithQuery } from "../commonComponents/LinkWithQuery";

const ReportLandingPage = () => {
  return (
    <div className="prime-home flex-1">
      <div className="grid-container padding-bottom-10 padding-top-4">
        <h2>Report lab results</h2>
        <div className="prime-container">
          <div className="grid-row grid-gap">
            <div className="tablet:grid-col-6 margin-bottom-2">
              <div className="card-container">
                <div className="usa-card__body">
                  <h3>I want to enter results individually</h3>
                  <p>
                    This option works well if you just have a few results to
                    report
                  </p>
                  <LinkWithQuery
                    to={"lab"}
                    className={"usa-button padding-y-2 margin-top-1"}
                  >
                    Enter lab results
                  </LinkWithQuery>
                </div>
              </div>
            </div>
            <div className="tablet:grid-col-6">
              <div className="card-container">
                <div className="usa-card__body">
                  <h3>I want to upload multiple results</h3>
                  <p>
                    This option works well if you have many results to report
                  </p>
                  <Button
                    type={"button"}
                    className={"padding-y-2 margin-top-1"}
                    disabled={true}
                  >
                    Coming soon
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportLandingPage;

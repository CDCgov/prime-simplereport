// import Button from "../../commonComponents/Button";
// import { displayFullName } from "../../utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const PatientLanding = () => {
  const savePatientAnswers = () => {
    console.log("saved");
  };

  return (
    <main className="patient-app patient-app--landing padding-bottom-4 bg-base-lightest">
      <div className="grid-container maxw-tablet">
        <h1 className="font-heading-lg margin-top-3 margin-bottom-2">
          Hello, Sam Williams
        </h1>
        <div className="prime-formgroup usa-prose">
          <h2 className="font-heading-lg">Test questionnaire</h2>
          <div className="usa-media-block">
            <FontAwesomeIcon
              icon={"check-circle"}
              className="usa-media-block__img margin-right-2"
            />
            <div className="usa-mmedia-block__body usa-prose">
              <h3 className="font-heading-sm">Questionnaire complete</h3>
              <p className="margin-top-05">
                You will receive a text notification when your result is ready.
              </p>
            </div>
          </div>
          {/* <Button
            label="Edit responses"
            onClick={savePatientAnswers}
            variant="outline"
            className="margin-top-3"
          /> */}
        </div>
        {/* <div className="prime-formgroup usa-prose">
          <table className="usa-table usa-table--borderless margin-y-0 width-full mobile-lg:width-auto">
            <caption className="font-heading-lg">Results</caption>
            <thead>
              <tr>
                <th scope="col">Result</th>
                <th scope="col">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">
                  <a className="usa-link" href="#0">
                    Positive
                  </a>
                </th>
                <td>12/21/2020</td>
              </tr>
              <tr>
                <th scope="row">
                  <a className="usa-link" href="#0">
                    Negative
                  </a>
                </th>
                <td>12/14/2020</td>
              </tr>
              <tr>
                <th scope="row">
                  <a className="usa-link" href="#0">
                    Negative
                  </a>
                </th>
                <td>12/7/2020</td>
              </tr>
            </tbody>
          </table>
        </div> */}
      </div>
    </main>
  );
};

export default PatientLanding;

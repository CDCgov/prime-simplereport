import Button from "../../commonComponents/Button";

const PatientLanding = () => {
  const savePatientAnswers = () => {
    console.log("saved");
  };

  return (
    <main className="patient-app patient-app--form padding-bottom-4">
      <div className="grid-container maxw-tablet">
        <h1 className="font-heading-lg margin-top-3 margin-bottom-2">
          Hello, Sam Williams
        </h1>
        <div className="prime-formgroup usa-prose">
          <h2 className="font-heading-lg">Test questionnaire</h2>
          <h3 className="font-heading-sm">Questionnaire complete</h3>
          <p className="margin-top-05">
            You can update your responses until your test result is submitted.
          </p>
          <Button
            label="Edit responses"
            onClick={savePatientAnswers}
            variant="outline"
          />
        </div>
        <div className="prime-formgroup usa-prose">
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
        </div>
      </div>
    </main>
  );
};

export default PatientLanding;

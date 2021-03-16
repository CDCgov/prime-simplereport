import { connect, useSelector } from "react-redux";

// import { formatFullName } from "../../app/utils/user";

const TestResult = () => {
  // const patient = useSelector((state) => (state as any).patient as any);
  // const fullName = formatFullName(patient);

  return (
    <main className="patient-app padding-top-105 padding-bottom-4 bg-base-lightest">
      <div className="grid-container maxw-tablet">
        <div className="card usa-prose">
          <h1 className="font-heading-lg">SARS-COV-2 result</h1>
          <h2 className="font-heading-sm">Patient</h2>
          <p className="margin-top-05">Sam Williams{/* {fullName} */}</p>
          <div className="grid-row">
            <div className="grid-col usa-prose">
              <h2 className="font-heading-sm">Test result</h2>
              <p className="margin-top-05">Positive</p>
            </div>
            <div className="grid-col usa-prose">
              <h2 className="font-heading-sm">Test date</h2>
              <p className="margin-top-05">12/21/2020</p>
            </div>
          </div>
          <h2 className="font-heading-sm">Test device</h2>
          <p className="margin-top-05">Sofia 2 SARS Antigen FIA</p>
          <h2 className="font-heading-sm">Notes</h2>
          <p>Please self-isolate at home. You can be around others after:</p>
          <ul>
            <li>
              10 days since symptoms first appeared <b>and</b>
            </li>
            <li>
              24 hours with no fever without the use of fever-reducing
              medications <b>and</b>
            </li>
            <li>Other symptoms of COVID-19 are improving*</li>
          </ul>
          <p>
            *Loss of taste and smell may persist for weeks or months after
            recovery and need not delay the end of isolation​
          </p>
          <p>
            Most people do not require testing to decide when they can be around
            others; however, if your healthcare provider recommends testing,
            they will let you know when you can resume being around others based
            on your test results.
          </p>
          <p>
            Note that these recommendations <b>do not</b> apply to persons with
            severe COVID-19 or with severely weakened immune systems
            (immunocompromised).
          </p>
          <p>
            For further guidance, please consult the{" "}
            <a href="https://www.cdc.gov/">
              Centers for Disease Control and Prevention (CDC)
            </a>{" "}
            website or contact your local health department.
          </p>
        </div>
      </div>
    </main>
  );
};

export default connect()(TestResult);

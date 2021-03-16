import { connect, useSelector } from "react-redux";

import { formatFullName } from "../../app/utils/user";

const TestResult = () => {
  const patient = useSelector((state) => (state as any).patient as any);
  const fullName = formatFullName(patient);

  return (
    <main className="patient-app patient-app--landing padding-bottom-4 bg-base-lightest">
      <div className="grid-container maxw-tablet">
        <h1 className="font-heading-lg margin-top-3 margin-bottom-2">
          {fullName}
        </h1>
        <div className="prime-formgroup usa-prose">
          <h2 className="font-heading-lg">Test result</h2>
          <div className="usa-media-block">
            <div className="usa-media-block__body usa-prose margin-top-105">
              <h3 className="font-heading-sm">Questionnaire complete</h3>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default connect()(TestResult);

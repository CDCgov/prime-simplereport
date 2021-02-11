import Button from "../../app/commonComponents/Button";

const TermsOfService = () => {

  return (
    <main className="patient-app padding-bottom-4 bg-base-lightest">
      <div className="grid-container maxw-tablet">
        <h1 className="font-heading-lg margin-top-3 margin-bottom-2">
          Terms of Service
        </h1>
        <div className="prime-formgroup usa-prose">
          <h2 className="font-heading-lg">Sup</h2>
          <div className="usa-media-block">
            <p>Some text</p>
          </div>
          <Button
            label="I consent to the Terms of Service"
            // onClick={savePatientAnswers}
            className="margin-top-3"
          />
        </div>
      </div>
    </main>
  );
};

export default TermsOfService;

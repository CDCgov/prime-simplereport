import Button from "../../commonComponents/Button";

const DOB = () => {
  const savePatientAnswers = () => {
    console.log("saved");
  };

  return (
    <>
      <main>
        <div className="grid-container maxw-tablet">
          <p className="margin-top-3">
            Enter your date of birth to access your COVID-19 Testing Portal.
          </p>
          <form className="usa-form">
            <label className="usa-label" htmlFor="bday" aria-describedby="bdayFormat">
              Date of birth
            </label>
            <span className="usa-hint text-ls-1">MM/DD/YYYY or MMDDYYYY</span>
            <input className="usa-input" id="bday" type="text" required aria-required="true" autoComplete="bday" size={8} pattern="[0-9]{8}" inputMode="numeric" />
            <Button label="Continue" onClick={savePatientAnswers} />
          </form>
        </div>
      </main>
    </>
  );
};

export default DOB;

// import TextInput from "../../commonComponents/TextInput";
import Button from "../../commonComponents/Button";

const DOB = () => {
  const savePatientAnswers = () => {
    console.log("saved");
  };

  return (
    <>
      <main>
        <div className="grid-container maxw-tablet">
          <p className="margin-top-3">Enter your date of birth to access your COVID-19 Testing Portal.</p>
          {/* // <TextInput
          //     type="date"
          //     label="Date of Birth (mm/dd/yyyy)"
          //     name="birthDate"
          //     value={patient.birthDate}
          //     onChange={onChange}
          //     required
          // /> */}
          <Button label="Continue" onClick={savePatientAnswers} />
        </div>
      </main>
    </>
  );
}

export default DOB;

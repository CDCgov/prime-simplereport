import { displayFullName } from "../../utils";
import Button from "../../commonComponents/Button";

interface Props {
  patient: any;
}

const PatientProfile = (props: Props) => {
  const fullName = displayFullName(
    props.patient.firstName,
    props.patient.middleName,
    props.patient.lastName
  );

  const savePatientAnswers = () => {
    console.log("saved");
  };

  const buttonGroup = (
    <div className="margin-top-3">
      <Button label="Confirm and continue" onClick={savePatientAnswers} />
      {/* <Button
        label="Edit information"
        onClick={savePatientAnswers}
        variant="outline"
        className="margin-top-105 mobile-lg:margin-top-0"
      /> */}
    </div>
  );

  return (
    <>
      <div className="usa-alert usa-alert--info margin-bottom-3">
        <div className="usa-alert__body">
          <p className="usa-alert__text">Confirm your profile info is correct. If it's incorrect, tell the testing administrator.</p>
        </div>
      </div>
      <div className="prime-formgroup usa-prose">
        <h2 className="prime-formgroup-heading font-heading-lg">
          General information
        </h2>
        <h3 className="font-heading-sm">Name</h3>
        <p>{fullName}</p>
        <h3 className="font-heading-sm">Date of birth</h3>
        <p>{props.patient.birthDate}</p>
        <h3 className="font-heading-sm">Phone number</h3>
        <p>{props.patient.telephone}</p>
        <h3 className="font-heading-sm">Phone type</h3>
        <p></p>
        <h3 className="font-heading-sm">Address</h3>
        <p>
          <span className="display-block">{props.patient.street}</span>
          <span className="display-block">{props.patient.streetTwo}</span>
          <span>
            {props.patient.city}
            {props.patient.city ? <span>,</span> : null} {props.patient.state}{" "}
            {props.patient.zipCode}
          </span>
        </p>
        <h3 className="font-heading-sm">Email address</h3>
        <p>{props.patient.email}</p>
        <h2 className="prime-formgroup-heading font-heading-lg">
          Demographics
        </h2>
        <h3 className="font-heading-sm">Race</h3>
        <p>{props.patient.race}</p>
        <h3 className="font-heading-sm">Tribal affiliation</h3>
        <p></p>
        <h3 className="font-heading-sm">Ethnicity</h3>
        <p>{props.patient.ethnicity}</p>
        <h3 className="font-heading-sm">Biological sex</h3>
        <p>{props.patient.gender}</p>
        <h2 className="prime-formgroup-heading font-heading-lg">Other</h2>
        <h3 className="font-heading-sm">
          Resident in congregate care/living setting
        </h3>
        <p>{props.patient.residentCongregateSetting}</p>
        <h3 className="font-heading-sm">Employed in healthcare</h3>
        <p>{props.patient.employedInHealthcare}</p>
      </div>
      {buttonGroup}
    </>
  );
};

export default PatientProfile;

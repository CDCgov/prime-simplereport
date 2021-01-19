import { formatFullName } from "../../utils/user";
import { formatBirthDate} from "../../utils/date";
import { RACE_VALUES, ETHNICITY_VALUES, GENDER_VALUES } from "../../constants"

import Button from "../../commonComponents/Button";

interface Props {
  patient: any;
}

const PatientProfile = (props: Props) => {
  const fullName = formatFullName(props.patient);
  const birthDate = formatBirthDate(props.patient.birthDate);
  const race =  RACE_VALUES.find(val => val.value === props.patient.race)?.label;
  const ethnicity =  ETHNICITY_VALUES.find(val => val.value === props.patient.ethnicity)?.label;
  const gender =  GENDER_VALUES.find(val => val.value === props.patient.gender)?.label;

  const notProvided = "Not provided";

  const savePatientAnswers = () => {
    console.log("saved");
  };


  const buttonGroup = (
    <div className="margin-top-3">
      <Button label="Confirm and continue" onClick={savePatientAnswers} />
    </div>
  );

  return (
    <>
      <div className="usa-alert usa-alert--info margin-bottom-3">
        <div className="usa-alert__body">
          <p className="usa-alert__text">
            Confirm that your profile info is correct. If it’s incorrect, tell the
            test administrator.
          </p>
        </div>
      </div>
      <div className="prime-formgroup usa-prose">
        <h2 className="prime-formgroup-heading font-heading-lg">
          General information
        </h2>
        <h3 className="font-heading-sm">Name</h3>
        <p>{fullName}</p>
        <h3 className="font-heading-sm">Date of birth</h3>
        <p>{birthDate || notProvided}</p>
        <h3 className="font-heading-sm">Phone number</h3>
        <p>{props.patient.telephone || notProvided}</p>
        {/* <h3 className="font-heading-sm">Phone type</h3>
        <p></p> */}
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
        <p>{props.patient.email || notProvided}</p>
        <h2 className="prime-formgroup-heading font-heading-lg">
          Demographics
        </h2>
        <h3 className="font-heading-sm">Race</h3>
        <p>{race || notProvided}</p>
        {/* <h3 className="font-heading-sm">Tribal affiliation</h3>
        <p></p> */}
        <h3 className="font-heading-sm">Ethnicity</h3>
        <p>{ethnicity || notProvided}</p>
        <h3 className="font-heading-sm">Biological sex</h3>
        <p>{gender || notProvided}</p>
        <h2 className="prime-formgroup-heading font-heading-lg">Other</h2>
        <h3 className="font-heading-sm">
          Resident in congregate care/living setting
        </h3>
        <p>{props.patient.residentCongregateSetting || notProvided}</p>
        <h3 className="font-heading-sm">Employed in healthcare</h3>
        <p>{props.patient.employedInHealthcare || notProvided}</p>
      </div>
      {buttonGroup}
    </>
  );
};

export default PatientProfile;

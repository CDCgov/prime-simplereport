import { useCallback, useEffect, useState } from "react";
import { Redirect } from "react-router";

import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import TextInput from "../../commonComponents/TextInput";
import Button from "../../commonComponents/Button/Button";
import StepIndicator from "../../commonComponents/StepIndicator";
import { accountCreationSteps } from "../../../config/constants";
import { phoneNumberIsValid } from "../../patients/personSchema";
import { emailIsValid } from "../../utils/email";
import { capitalizeText } from "../../utils/text";
import { LoadingCard } from "../LoadingCard/LoadingCard";

interface Props {
  type: "phone number" | "email address";
  serviceEnroll: Function;
  cardText: string;
  cardHint?: string;
}

export const MfaSendCodeToContact = (props: Props) => {
  const [contact, setContact] = useState("");
  const [contactError, setContactError] = useState("");
  const [formIsDirty, setFormIsDirty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const contactIsValid =
    props.type === "phone number" ? phoneNumberIsValid : emailIsValid;

  const validateContact = useCallback(() => {
    setFormIsDirty(true);
    let error = "";
    if (!contact) {
      error = `Enter your ${props.type}`;
      setContactError(error);
      return false;
    }

    let valid;
    try {
      valid = contactIsValid(contact);
    } catch (e) {
      valid = false;
    }

    if (!valid) {
      error = `Enter a valid ${props.type}`;
    }
    setContactError(error);
    return error === "";
  }, [contact, contactIsValid, props.type]);

  const handleSubmit = async () => {
    if (validateContact()) {
      setLoading(true);
      try {
        await props.serviceEnroll(contact);
        setSubmitted(true);
      } catch (error) {
        setContactError(`API Error: ${error?.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (formIsDirty) {
      validateContact();
    }
  }, [formIsDirty, validateContact]);

  if (loading) {
    return <LoadingCard message={`Validating ${props.type}...`} />;
  }

  if (submitted) {
    return (
      <Redirect
        to={{
          pathname: `${window.location.pathname.split("/uac")[1]}/verify`,
          state: { contact },
        }}
      />
    );
  }

  return (
    <CardBackground>
      <Card logo bodyKicker="Set up your account">
        <StepIndicator
          steps={accountCreationSteps}
          currentStepValue={"2"}
          noLabels={true}
        />
        <p className="margin-bottom-0">{props.cardText}</p>
        <p className="usa-hint font-ui-2xs">
          We’ll send you a security code each time you sign in.
        </p>
        {props.cardHint ? (
          <p className="usa-hint font-ui-2xs">{props.cardHint}</p>
        ) : null}
        <TextInput
          label={capitalizeText(props.type)}
          name={
            props.type === "email address" ? "email-address" : "phone-number"
          }
          type={props.type === "email address" ? "email" : "tel"}
          value={contact}
          errorMessage={contactError}
          validationStatus={contactError ? "error" : undefined}
          onBlur={validateContact}
          onChange={(evt) => setContact(evt.target.value)}
        />
        <Button
          className="margin-top-3"
          label={"Send code"}
          type={"submit"}
          onClick={handleSubmit}
        />
      </Card>
      <p className="margin-top-5">
        <a href="#0">Return to previous step</a>
      </p>
    </CardBackground>
  );
};

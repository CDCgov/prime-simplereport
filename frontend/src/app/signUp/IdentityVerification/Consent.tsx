import { useState } from "react";
import { useLocation } from "react-router";
import { Redirect } from "react-router-dom";

import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import Button from "../../commonComponents/Button/Button";

import PersonalDetailsForm, {
  PersonalDetailsFormProps,
} from "./PersonalDetailsForm";

const Consent = () => {
  // Get person name & org id from route state
  const { orgExternalId, firstName, middleName, lastName } =
    useLocation<PersonalDetailsFormProps>().state || {};
  const [submitted, setSubmitted] = useState(false);

  if (!orgExternalId || !firstName || !lastName) {
    return <Redirect to={{ pathname: "/sign-up" }} />;
  }

  if (submitted) {
    return (
      <PersonalDetailsForm
        orgExternalId={orgExternalId}
        firstName={firstName}
        middleName={middleName}
        lastName={lastName}
      />
    );
  }

  return (
    <CardBackground>
      <Card logo bodyKicker="Identity verification consent">
        <div className="margin-bottom-2">
          <p className="font-ui-2xs text-base">
            To create an account, you’ll need to consent to identity
            verification by{" "}
            <a href="https://www.experian.com/decision-analytics/identity-proofing">
              Experian
            </a>
            . SimpleReport doesn’t access your identity verification details.
          </p>
          <p className="font-ui-2xs text-base margin-top-0">
            You understand that by clicking on the "I agree" button immediately
            following this notice, you are providing ‘written instructions’ to
            SimpleReport under the Fair Credit Reporting Act, authorizing
            SimpleReport to obtain information from your personal credit profile
            or other information from Experian. You authorize SimpleReport to
            obtain such information solely to verify your identity to avoid
            fraudulent transactions in your name.
          </p>
          <p className="font-ui-2xs text-base margin-top-0">
            You authorize your wireless operator to disclose to us details of
            your account, subscriber, billing, and device, if available, to
            support verification of identity, fraud avoidance in support of and
            for the duration of your business relationship with us. Where
            applicable, this information may also be shared by us with other
            companies to support your transactions and for fraud avoidance
            purposes. You can see a more detailed list of information
            potentially disclosed and how we use your data in our{" "}
            <a href="https://www.cdc.gov/other/privacy.html">privacy policy</a>.
          </p>
        </div>
        <Button
          className="width-full"
          onClick={() => setSubmitted(true)}
          label={"I agree"}
        />
      </Card>
    </CardBackground>
  );
};

export default Consent;

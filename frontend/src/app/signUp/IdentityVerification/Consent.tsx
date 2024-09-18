import { useState } from "react";
import { useLocation, Navigate } from "react-router-dom";

import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import Button from "../../commonComponents/Button/Button";
import { useDocumentTitle } from "../../utils/hooks";

import PersonalDetailsForm, {
  PersonalDetailsFormProps,
} from "./PersonalDetailsForm";

const Consent = () => {
  // Get person name & org id from route state
  const { orgExternalId, firstName, middleName, lastName } =
    (useLocation().state as PersonalDetailsFormProps) || {};
  const [submitted, setSubmitted] = useState(false);
  useDocumentTitle("Sign up - identity verification consent");

  if (!orgExternalId || !firstName || !lastName) {
    return <Navigate to="/sign-up" />;
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
      <Card logo>
        <h1 className="font-ui-sm text-bold margin-top-3">
          {" "}
          Identity verification consent{" "}
        </h1>
        <div className="margin-bottom-2">
          <p className="font-ui-2xs text-base">
            To create a SimpleReport account, you’ll need to agree to identity
            verification. The identity verification service we use is done by{" "}
            <a
              href="https://www.experian.com/business/solutions/identity-solutions/identity-proofing"
              target="_blank"
              rel="noopener noreferrer"
            >
              Experian
            </a>{" "}
            — SimpleReport won’t access your identity verification details. This
            process isn’t a formal credit check and won’t impact your credit
            score.
          </p>
          <p className="font-ui-2xs text-base margin-top-0">
            By clicking on the "I agree" button below, you understand that you
            are providing ‘written instructions’ authorizing SimpleReport to
            verify your identity via Experian and, if needed, via their identity
            verification partners — such as your mobile service provider. As
            part of the authorization your mobile service provider may disclose
            to Experian details of your account, if available. This
            authorization allows us to obtain information only to verify your
            identity and to avoid fraudulent activity in your name while you are
            a SimpleReport customer. You can review a detailed list of
            information potentially disclosed and how we use your data in our{" "}
            <a
              href="https://www.cdc.gov/other/privacy.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              privacy policy
            </a>
            .
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

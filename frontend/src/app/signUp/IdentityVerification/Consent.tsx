import { useState } from "react";

import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import Button from "../../commonComponents/Button/Button";
import { useSearchParam } from "../../utils/url";
import Checkboxes from "../../commonComponents/Checkboxes";

import PersonalDetailsForm from "./PersonalDetailsForm";

const Consent = () => {
  // Get organization ID from URL
  const orgExternalId = useSearchParam("orgExternalId");
  const [consentGiven, setConsentGiven] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState(false);

  if (orgExternalId === null) {
    return (
      <CardBackground>
        <Card logo bodyKicker={"Invalid request"} bodyKickerCentered={true}>
          <p className="text-center">
            We weren't able to find your affiliated organization
          </p>
        </Card>
      </CardBackground>
    );
  }

  if (submitted) {
    return <PersonalDetailsForm orgExternalId={orgExternalId} />;
  }

  return (
    <CardBackground>
      <Card logo bodyKicker="Consent to Identify Verification">
        <div className="margin-bottom-2">
          <p className="font-ui-2xs text-base">
            To create your account, you’ll need to consent to identity
            verification by{" "}
            <a href="https://www.experian.com/decision-analytics/identity-proofing">
              Experian
            </a>
            . SimpleReport doesn’t access identity verification details.
          </p>
          <p className="font-ui-2xs text-base margin-top-0">
            You understand that by clicking on the I AGREE button immediately
            following this notice, you are providing ‘written instructions’ to
            SimpleReport under the Fair Credit Reporting Act authorizing
            SimpleReport to obtain information from your personal credit profile
            or other information from Experian. You authorize SimpleReport to
            obtain such information solely to verify your identity to avoid
            fraudulent transactions in your name.
          </p>
          <p className="font-ui-2xs text-base margin-top-0 margin-bottom-neg-2">
            You authorize your wireless operator to disclose to us details of
            your account, subscriber, billing and device, if available, to
            support verification of identity, fraud avoidance in support of and
            for the duration of your business relationship with us. Where
            applicable, this information may also be shared by us with other
            companies to support your transactions and for fraud avoidance
            purposes. You can see a more detailed list of information
            potentially disclosed and how we use your data in our Privacy
            Policy.
          </p>
          <div className="display-flex flex-column flex-align-center">
            <Checkboxes
              className="margin-top-neg-3"
              onChange={(e) => setConsentGiven(e.target.checked)}
              name="consent_given"
              legend=""
              boxes={[
                {
                  value: "1",
                  label: "I AGREE",
                  checked: consentGiven,
                },
              ]}
            />
          </div>
        </div>
        <Button
          className="width-full"
          disabled={!consentGiven}
          onClick={() => setSubmitted(true)}
          label={"Submit"}
        />
      </Card>
    </CardBackground>
  );
};

export default Consent;

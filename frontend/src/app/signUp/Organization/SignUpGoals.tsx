import { useState } from "react";

import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import Button from "../../commonComponents/Button/Button";
import RadioGroup from "../../commonComponents/RadioGroup";
import { useDocumentTitle } from "../../utils/hooks";

import OrganizationForm from "./OrganizationForm";
import RequestAccess from "./RequestAccess";
import RequestTestResult from "./RequestTestResult";

import "./SignUpGoals.scss";

const SignUpGoals = () => {
  const [submitted, setSubmitted] = useState(false);
  const [signUpGoal, setSignUpGoal] = useState("");

  useDocumentTitle("Sign up - select status");

  const onSubmit = () => {
    setSubmitted(true);
  };

  if (submitted) {
    switch (signUpGoal) {
      case "existingOrg":
        return <RequestAccess />;
      case "testResult":
        return <RequestTestResult />;
      default:
        return <OrganizationForm />;
    }
  }

  return (
    <CardBackground>
      <Card logo cardIsForm>
        <div className="sign-up-goals-card usa-prose margin-bottom-3">
          <h1 className="margin-top-2 font-ui-lg">Sign up for SimpleReport</h1>
          <p className="subheader margin-bottom-0">
            To get you to the right place, tell us a little about yourself.
          </p>
          <RadioGroup
            wrapperClassName="margin-top-1"
            name="signUpGoal"
            legend="Select Sign Up Goal"
            legendSrOnly
            buttons={[
              {
                value: "existingOrg",
                label: "My organization is already using SimpleReport",
              },
              {
                value: "newOrg",
                label: "My organization is new to SimpleReport",
                labelDescription:
                  "Create a SimpleReport account for your organization or workplace.",
              },
              {
                value: "testResult",
                label: "I’m trying to get my test results",
                labelDescription: "No sign-up needed.",
              },
            ]}
            selectedRadio={signUpGoal}
            onChange={setSignUpGoal}
            variant="tile"
          />
        </div>
        <Button
          className="width-full continue-button"
          onClick={onSubmit}
          label={"Continue"}
          disabled={!signUpGoal}
        />
      </Card>
    </CardBackground>
  );
};

export default SignUpGoals;

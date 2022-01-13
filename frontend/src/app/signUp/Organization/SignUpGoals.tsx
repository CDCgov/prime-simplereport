import { useState } from "react";

import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import Button from "../../commonComponents/Button/Button";
import RadioGroup from "../../commonComponents/RadioGroup";

import OrganizationForm from "./OrganizationForm";
import RequestAccess from "./RequestAccess";
import RequestTestResult from "./RequestTestResult";

import "./SignUpGoals.scss";

const SignUpGoals = () => {
  const [submitted, setSubmitted] = useState(false);
  const [signUpGoal, setSignUpGoal] = useState("");
  const [signUpGoalError, setSignUpGoalError] = useState("");

  if (submitted) {
    switch (signUpGoal) {
      case "newOrg":
        return <OrganizationForm />;
      case "existingOrg":
        return <RequestAccess />;
      case "testResult":
        return <RequestTestResult />;
      default:
        break;
    }
  }

  const onSubmit = () => {
    if (signUpGoal === "") {
      setSignUpGoalError("Please select an option");
    } else {
      setSignUpGoalError("");
      setSubmitted(true);
    }
  };

  return (
    <CardBackground>
      <Card logo>
        <div className="sign-up-goals-card usa-prose margin-bottom-2">
          <h3 className="margin-top-2">Sign up for SimpleReport</h3>
          <p className="subheader margin-bottom-0">
            To get you to the right place, tell us a little about yourself.
          </p>
          <RadioGroup
            className="margin-bottom-1"
            wrapperClassName="margin-top-1"
            name="signUpGoal"
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
                label: "I’m trying to get my COVID-19 test results",
                labelDescription: "No sign-up needed.",
              },
            ]}
            selectedRadio={signUpGoal}
            errorMessage={signUpGoalError}
            validationStatus={signUpGoalError ? "error" : undefined}
            onChange={setSignUpGoal}
            variant="tile"
          />
        </div>
        <Button
          className="width-full continue-button"
          onClick={onSubmit}
          label={"Continue"}
        />
      </Card>
    </CardBackground>
  );
};

export default SignUpGoals;

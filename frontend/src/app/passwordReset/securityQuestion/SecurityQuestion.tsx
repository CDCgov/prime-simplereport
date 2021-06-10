import { useState } from "react";

import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import TextInput from "../../commonComponents/TextInput";
import Button from "../../commonComponents/Button/Button";

export const SecurityAnswer = () => {
  const [code, setAnswer] = useState("");
  const [codeError, setAnswerError] = useState("");

  const validateAnswer = (): boolean => {
    let error = "";
    if (code === "") {
      error = "Enter your answer";
    }
    setAnswerError(error);
    return error === "";
  };

  return (
    <CardBackground>
      <Card logo>
        <h1 className="font-ui-sm margin-top-3">Security question</h1>
        <TextInput
          className="flex-fill"
          label={"Where did you go for your favorite vacation?"}
          name={"security-code"}
          type={"tel"}
          value={code}
          errorMessage={codeError}
          validationStatus={codeError ? "error" : undefined}
          onBlur={validateAnswer}
          onChange={(evt) => setAnswer(evt.currentTarget.value)}
        />
        <Button
          className="margin-top-3"
          label={"Continue"}
          type={"submit"}
          onClick={validateAnswer}
        />
        <p className="usa-hint font-ui-2xs margin-top-3 margin-bottom-0">
          Forgot your answer?
        </p>
        <p className="usa-hint font-ui-2xs margin-top-05 margin-bottom-0">
          Contact your SimpleReport organization administrator for a temporary
          password.
        </p>
      </Card>
      <p className="margin-top-4">
        <a href="#0">Return to sign in</a>
      </p>
    </CardBackground>
  );
};

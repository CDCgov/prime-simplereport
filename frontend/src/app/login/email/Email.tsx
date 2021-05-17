import { useEffect, useState } from "react";

import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import TextInput from "../../commonComponents/TextInput";
import Button from "../../commonComponents/Button/Button";

export const Email = () => {
  return (
    <CardBackground>
      <Card logo>
        <h1 className="font-ui-sm margin-top-3">Set up your account</h1>
        <TextInput
          label={"Email address"}
          name={"email"}
          type={"email"}
          // value={email}
          required
          // errorMessage={emailError}
          // validationStatus={emailError ? "error" : undefined}
          // onBlur={validateEmail}
          // onChange={handleEmailChange}
        />
        <TextInput
          label={"Password"}
          name={"password"}
          type={"password"}
          // value={password}
          required
          // errorMessage={passwordError}
          // validationStatus={passwordError ? "error" : undefined}
          // onBlur={validatePassword}
          // onChange={handlePasswordChange}
        />
        <Button
          className="margin-top-3"
          label={"Sign in"}
          type={"submit"}
          // onClick={handleSubmit}
        />
      </Card>
      <p className="margin-top-4">
        <a href="#0">Forgot your password?</a>
      </p>
    </CardBackground>
  );
};

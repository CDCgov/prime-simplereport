import { useState } from "react";

import { CardContainer } from "../commonComponents/CardContainer";
import TextInput from "../commonComponents/TextInput";

export const PasswordForm = () => {
  const [password, setPassword] = useState("");

  return (
    <CardContainer logo>
    <TextInput
      label={"Password"}
      name={"password"}
      onChange={(evt) => setPassword(evt.currentTarget.value)}
    />
    </CardContainer>
  );
};

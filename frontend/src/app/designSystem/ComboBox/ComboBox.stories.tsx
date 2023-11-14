import React from "react";
import { Form } from "@trussworks/react-uswds";

import ComboBox from "./ComboBox";
import { fruits } from "./fruits";

export default {
  title: "Components/Combo box",
  component: ComboBox,
  tags: ["autodocs"],
  // ### USWDS 3.0 ComboBox component
  //
  // Source: https://designsystem.digital.gov/components/combo-box
  // `,
  //       },
  //     },
  //   },
};

const noop = (): void => {
  return;
};

const DROPDOWN_LABEL = "Select your desired fruit";

export const WithLabelNoDefaultValue = (): React.ReactElement => {
  const fruitList = Object.entries(fruits).map(([key, value]) => ({
    value: key,
    label: value,
  }));

  return (
    <Form onSubmit={noop}>
      <ComboBox
        id="input-ComboBox"
        name="input-ComboBox"
        options={fruitList}
        onChange={noop}
        label={DROPDOWN_LABEL}
      />
    </Form>
  );
};

export const WithLabelDefaultValue = (): React.ReactElement => {
  const fruitList = Object.entries(fruits).map(([key, value]) => ({
    value: key,
    label: value,
  }));

  return (
    <Form onSubmit={noop}>
      <ComboBox
        id="input-ComboBox"
        name="input-ComboBox"
        options={fruitList}
        onChange={noop}
        defaultValue={"mango"}
        label={DROPDOWN_LABEL}
      />
    </Form>
  );
};

export const WithLabelNoOptions = (): React.ReactElement => {
  return (
    <Form onSubmit={noop}>
      <ComboBox
        id="input-ComboBox"
        name="input-ComboBox"
        options={[]}
        onChange={noop}
        label={DROPDOWN_LABEL}
      />
    </Form>
  );
};

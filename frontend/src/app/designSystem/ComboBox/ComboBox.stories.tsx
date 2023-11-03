import React, { useRef } from "react";
import { ComboBoxRef, Form, Button } from "@trussworks/react-uswds";

import ComboBox from "./ComboBox";
import { fruits } from "./fruits";

export default {
  title: "Components/Combo box",
  component: ComboBox,
  //   parameters: {
  //     docs: {
  //       description: {
  //         component: `
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

export const DefaultComboBoxWithPropOptions = (): React.ReactElement => {
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
        label={"Select a fruit"}
      />
    </Form>
  );
};

export const WithDefaultValue = (): React.ReactElement => {
  const fruitList = Object.entries(fruits).map(([value, key]) => ({
    value: value,
    label: key,
  }));

  return (
    <Form onSubmit={noop}>
      <ComboBox
        id="input-ComboBox"
        name="input-ComboBox"
        options={fruitList}
        onChange={noop}
        defaultValue="mango"
        label={"Select a fruit"}
      />
    </Form>
  );
};

export const WithLabel = (): React.ReactElement => {
  const fruitList = Object.entries(fruits).map(([value, key]) => ({
    value: value,
    label: key,
  }));

  return (
    <Form onSubmit={noop}>
      <ComboBox
        id="fruit"
        name="fruit"
        options={fruitList}
        onChange={noop}
        ulProps={{ "aria-labelledby": "fruit-label" }}
        label={"Select a fruit"}
      />
    </Form>
  );
};

export const Disabled = (): React.ReactElement => {
  const fruitList = Object.entries(fruits).map(([value, key]) => ({
    value: value,
    label: key,
  }));

  return (
    <Form onSubmit={noop}>
      <ComboBox
        id="fruit"
        name="fruit"
        options={fruitList}
        onChange={noop}
        disabled
        label={"Select a fruit"}
      />
    </Form>
  );
};

export const ExposedRefMethods = (): React.ReactElement => {
  const ref = useRef<ComboBoxRef>(null);

  const fruitList = Object.entries(fruits).map(([value, key]) => ({
    value: value,
    label: key,
  }));

  const handleClearSelection = (): void => ref.current?.clearSelection();
  const handleFocus = (): void => ref.current?.focus();

  return (
    <Form onSubmit={noop}>
      <ComboBox
        id="fruit"
        name="fruit"
        options={fruitList}
        onChange={noop}
        ref={ref}
        label={"Select a fruit"}
      />
      <Button type="reset" onClick={handleClearSelection}>
        Clear Selected Value
      </Button>

      <Button type="button" onClick={handleFocus}>
        Focus on input
      </Button>
    </Form>
  );
};

export const CustomInputChangeHandler = (): React.ReactElement => {
  const fruitList = Object.entries(fruits).map(([value, key]) => ({
    value: value,
    label: key,
  }));

  const options = [...fruitList];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    if (value && fruitList.findIndex((f) => f.value === value) < 0) {
      if (options.length === fruitList.length) {
        // Add new option to end of list
        options.push({ value, label: value });
      } else {
        // Rewrite the new option
        options[options.length - 1] = { value, label: `Add new: ${value}` };
      }
    }
  };

  return (
    <Form onSubmit={noop}>
      <ComboBox
        id="fruit"
        name="fruit"
        options={options}
        onChange={noop}
        inputProps={{ onChange: handleInputChange }}
        label={"Select a fruit"}
      />
    </Form>
  );
};

import React from "react";
import {
  DatePicker,
  Form,
  FormGroup,
  Label,
  TextInput,
} from "@trussworks/react-uswds";

export default {
  title: "Components/Form controls/Date picker",
  component: DatePicker,
  argTypes: {
    onSubmit: { action: "submitted" },
    disabled: { control: { type: "boolean" } },
  },
  parameters: {
    docs: {
      description: {
        component: `
### USWDS 2.0 DatePicker component

Source: https://designsystem.digital.gov/components/form-controls/#DatePicker

**Note:** There is one small difference in functionality between this component and the USWDS implementation, related to validating the input. The USWDS implementation validates when:
- setting the initial value based on the default value passed in
- clicking on a date in the calendar UI
- typing the Enter key in the external text input
- on focusout (blur) of the external text input

Because this component uses the useEffect hook to trigger validation whenever the date value changes (regardless of how), the React DatePicker will validate when:
- setting the initial value based on the default value passed in (same as above)
- clicking on a date in the calendar UI (same as above)
- on input (change) of the external text input

It's also worth mentioning that validation in this case is just calling [setCustomValidity](https://developer.mozilla.org/en-US/docs/Web/API/HTMLObjectElement/setCustomValidity) on the external text input, and library users should be able to determine how & when they want invalid UI to display by inspecting the [ValidityState](https://developer.mozilla.org/en-US/docs/Web/API/ValidityState) of the external input.

We may find that we want to expose props for custom event handlers or even a ref to the component for better integration with 3rd party form libraries. If you are running into this, please [file an issue](https://github.com/trussworks/react-uswds/issues/new/choose) describing your use case.
`,
      },
    },
  },
};

export const CompleteDatePicker = (argTypes: {
  onSubmit: ((event: React.FormEvent<HTMLFormElement>) => void) &
    React.FormEventHandler<HTMLFormElement>;
  disabled: boolean | undefined;
}): React.ReactElement => (
  <Form onSubmit={argTypes.onSubmit}>
    <FormGroup>
      <Label id="appointment-date-label" htmlFor="appointment-date">
        Appointment date
      </Label>
      <div className="usa-hint" id="appointment-date-hint">
        mm/dd/yyyy
      </div>
      <DatePicker
        id="appointment-date"
        name="appointment-date"
        aria-describedby="appointment-date-label appointment-date-hint"
        disabled={argTypes.disabled}
      />
      <div className="usa-form-group">
        <Label htmlFor="otherInput">Another unrelated input</Label>
        <TextInput id="otherInput" name="otherInput" type="text" />
      </div>
    </FormGroup>
  </Form>
);

export const DefaultDatePicker = (): React.ReactElement => (
  <DatePicker id="birthdate" name="birthdate" />
);

export const Disabled = (): React.ReactElement => (
  <DatePicker id="birthdate" name="birthdate" disabled />
);

export const WithDefaultValue = (): React.ReactElement => (
  <DatePicker id="birthdate" name="birthdate" defaultValue="1988-05-16" />
);

export const WithDefaultInvalidValue = (): React.ReactElement => (
  <DatePicker
    id="birthdate"
    name="birthdate"
    defaultValue="1988-05-16"
    minDate="2020-01-01"
  />
);

export const WithMinMaxInSameMonth = (): React.ReactElement => (
  <DatePicker
    id="birthdate"
    name="birthdate"
    minDate="2021-01-10"
    maxDate="2021-01-20"
  />
);

export const WithMinMax = (): React.ReactElement => (
  <DatePicker
    id="birthdate"
    name="birthdate"
    minDate="2020-01-01"
    maxDate="2021-5-31"
  />
);

export const WithRangeDate = (): React.ReactElement => (
  <DatePicker
    id="birthdate"
    name="birthdate"
    defaultValue="2021-01-20"
    rangeDate="2021-01-08"
  />
);

export const WithLocalizations = (): React.ReactElement => (
  <DatePicker id="birthdate" name="birthdate" />
);

import React, { useEffect, useState } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { Redirect } from 'react-router';
import { gql, useLazyQuery } from '@apollo/client';
import moment from 'moment';

import Button from '../../app/commonComponents/Button';
import TextInput from '../../app/commonComponents/TextInput';
import { setPatient } from '../../app/store';

const PATIENT_LINK_VALIDATION_QUERY = gql`
  query PatientLinkVerify($plid: String!, $birthDate: LocalDate!) {
    patientLinkVerify(internalId: $plid, birthDate: $birthDate) {
      internalId
      firstName
      middleName
      lastName
      birthDate
      street
      streetTwo
      city
      state
      zipCode
      telephone
      role
      email
      county
      race
      ethnicity
      gender
      residentCongregateSetting
      employedInHealthcare
    }
  }
`;

const DOB = () => {
  const dispatch = useDispatch();
  const [birthDate, setBirthDate] = useState('');
  const [formattedBirthDate, setFormattedBirthDate] = useState('');
  const [birthDateError, setBirthDateError] = useState('');
  const [nextPage, setNextPage] = useState(false);
  const dobRef = React.createRef() as any;
  const plid = useSelector((state) => (state as any).plid as String);

  const [validateBirthDate, { called, loading, data }] = useLazyQuery(
    PATIENT_LINK_VALIDATION_QUERY,
    {
      variables: { plid, birthDate: formattedBirthDate },
      fetchPolicy: 'no-cache',
    }
  );

  useEffect(() => {
    if (!data) return;
    const patient = data.patientLinkVerify;
    const residentCongregateSetting = patient.residentCongregateSetting
      ? 'YES'
      : 'NO';
    const employedInHealthcare = patient.employedInHealthcare ? 'YES' : 'NO';

    dispatch(
      setPatient({
        ...patient,
        residentCongregateSetting,
        employedInHealthcare,
      })
    );

    setNextPage(true);
    // eslint-disable-next-line
  }, [data]);

  const isValidForm = () => {
    const validDate = moment(birthDate.replace('/', ''), 'MMDDYYYY').isValid();

    if (validDate) {
      setBirthDateError('');
      return true;
    } else {
      dobRef.current.focus();
      setBirthDateError('Enter your date of birth');
      return false;
    }
  };

  const confirmBirthDate = () => {
    if (isValidForm()) {
      setFormattedBirthDate(
        moment(birthDate.replace('/', ''), 'MMDDYYYY').format('YYYY-MM-DD')
      );
      validateBirthDate();
    }
  };

  if (called && loading) {
    return (
      <main>
        <div className="grid-container maxw-tablet">
          <p className="margin-top-3">Validating birth date...</p>
        </div>
      </main>
    );
  }

  if (nextPage) {
    return (
      <Redirect
        push
        to={{
          pathname: '/patient-info-confirm',
        }}
      />
    );
  }

  return (
    <>
      <main>
        <div className="grid-container maxw-tablet">
          <p className="margin-top-3">
            Enter your date of birth to access your COVID-19 Testing Portal.
          </p>
          <form className="usa-form" onSubmit={confirmBirthDate}>
            <TextInput
              label={'Date of birth'}
              name={'birthDate'}
              type={'bday'}
              autoComplete={'bday'}
              value={birthDate}
              size={8}
              pattern={'([0-9]{1,2}/[0-9]{1,2}/[0-9]{4})|([0-9]{8})'}
              inputMode={'numeric'}
              ariaDescribedBy={'bdayFormat'}
              hintText={'MM/DD/YYYY or MMDDYYYY'}
              errorMessage={birthDateError}
              hideOptional={true}
              validationStatus={birthDateError ? 'error' : undefined}
              onChange={(evt) => setBirthDate(evt.currentTarget.value)}
              inputRef={dobRef}
            />
            <Button id="dob-submit-button" label={'Continue'} type={'submit'} />
          </form>
        </div>
      </main>
    </>
  );
};

export default connect()(DOB);

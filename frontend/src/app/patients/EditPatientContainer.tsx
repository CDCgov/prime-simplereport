import React from 'react';
import { useSelector } from 'react-redux';

import EditPatient from './EditPatient';

interface Props {
  patientId: string;
}

const EditPatientContainer: React.FC<Props> = ({ patientId }) => {
  const activeFacilityId = useSelector(
    (state) => (state as any).facility.id as string
  );
  if (activeFacilityId.length < 1) {
    return <div>"No facility selected"</div>;
  }
  return <EditPatient facilityId={activeFacilityId} patientId={patientId} />;
};

export default EditPatientContainer;

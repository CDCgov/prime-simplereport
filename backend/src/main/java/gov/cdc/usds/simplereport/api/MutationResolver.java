package gov.cdc.usds.simplereport.api;

import gov.cdc.usds.simplereport.api.model.Device;
import gov.cdc.usds.simplereport.api.model.Patient;
import graphql.kickstart.tools.GraphQLMutationResolver;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * Created by nickrobison on 11/15/20
 */
@Component
public class MutationResolver implements GraphQLMutationResolver {

    public void addDevice(String deviceID, String displayName, String deviceManufacturer, String deviceModel, boolean isDefault) {
        final Device d = new Device(deviceID, displayName, deviceManufacturer, deviceModel, isDefault);
        DummyDataRepo.allDevices.add(d);
    }

    public void addPatient(String patientID, String firstName, String middleName, String lastName, LocalDate birthDate, String address, String phone) {
        final Patient p = new Patient(patientID, firstName, middleName, lastName, birthDate, address, phone);
        DummyDataRepo.allPatients.add(p);
    }
}

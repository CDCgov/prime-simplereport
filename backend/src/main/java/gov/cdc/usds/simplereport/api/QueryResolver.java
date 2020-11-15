package gov.cdc.usds.simplereport.api;

import gov.cdc.usds.simplereport.api.model.Device;
import gov.cdc.usds.simplereport.api.model.Patient;
import graphql.kickstart.tools.GraphQLQueryResolver;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Created by nickrobison on 11/15/20
 */
@Component
public class QueryResolver implements GraphQLQueryResolver {

    public List<Patient> getPatient() {
        return DummyDataRepo.allPatients;
    }

    public List<Device> getDevice() {
        return DummyDataRepo.allDevices;
    }
}

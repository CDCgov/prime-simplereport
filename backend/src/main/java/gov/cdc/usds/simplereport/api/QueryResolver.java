package gov.cdc.usds.simplereport.api;

import gov.cdc.usds.simplereport.api.model.*;
import graphql.kickstart.tools.GraphQLQueryResolver;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Created by nickrobison on 11/15/20
 */
@Component
public class QueryResolver implements GraphQLQueryResolver {

    private final DummyDataRepo repo;

    public QueryResolver(DummyDataRepo repo) {
        this.repo = repo;
    }

    public List<Patient> getPatients() {
        return repo.allPatients;
    }

    public Patient getPatient(String id) {
        return repo.getPatient(id);
    }

    public List<Device> getDevice() {
        return repo.allDevices;
    }

    public User getUser() {
        return repo.defaultUser;
    }

    public Organization getOrganization() {
        return repo.defaultOrg;
    }

    public List<TestResult> getTestResult() {
        return repo.allTestResults;
    }

    public List<TestOrder> getQueue() {
        return repo.queue;
    }
}

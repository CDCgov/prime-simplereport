package gov.cdc.usds.simplereport.api;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import gov.cdc.usds.simplereport.api.model.Device;
import gov.cdc.usds.simplereport.api.model.Organization;
import gov.cdc.usds.simplereport.api.model.TestOrder;
import gov.cdc.usds.simplereport.api.model.TestResult;
import gov.cdc.usds.simplereport.api.model.User;
import gov.cdc.usds.simplereport.service.PersonService;
import graphql.kickstart.tools.GraphQLQueryResolver;

/**
 * Created by nickrobison on 11/15/20
 */
@Component
public class QueryResolver implements GraphQLQueryResolver {

    private final DummyDataRepo repo;

    @Autowired
    private PersonService ps;

    public QueryResolver(DummyDataRepo repo) {
        this.repo = repo;
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

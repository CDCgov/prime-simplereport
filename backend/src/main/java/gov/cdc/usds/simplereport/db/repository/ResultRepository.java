package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.TestResult;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ResultRepository extends EternalEntityRepository<TestResult> {

    @Query(BASE_QUERY + " and organization = :org")
    public List<TestResult> findAllByOrganization(Organization org);
}

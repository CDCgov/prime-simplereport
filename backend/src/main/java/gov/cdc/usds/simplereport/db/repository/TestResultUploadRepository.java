package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.TestResultUpload;
import java.util.List;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface TestResultUploadRepository
    extends AuditedEntityRepository<TestResultUpload>, JpaSpecificationExecutor<TestResultUpload> {

  List<TestResultUpload> findAllByOrganization(Organization o);
}

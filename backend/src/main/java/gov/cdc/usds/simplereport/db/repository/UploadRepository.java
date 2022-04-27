package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.BulkTestResultUpload;
import gov.cdc.usds.simplereport.db.model.Organization;
import java.util.List;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface UploadRepository
    extends AuditedEntityRepository<BulkTestResultUpload>,
        JpaSpecificationExecutor<BulkTestResultUpload> {

  List<BulkTestResultUpload> findAllByOrganization(Organization o);
}

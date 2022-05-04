package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.BulkTestResultUpload;
import gov.cdc.usds.simplereport.db.model.Organization;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface UploadRepository
    extends AuditedEntityRepository<BulkTestResultUpload>,
        JpaSpecificationExecutor<BulkTestResultUpload> {

  List<BulkTestResultUpload> findAllByOrganization(Organization o);

  Optional<BulkTestResultUpload> findByInternalIdAndOrganization(UUID id, Organization o);
}

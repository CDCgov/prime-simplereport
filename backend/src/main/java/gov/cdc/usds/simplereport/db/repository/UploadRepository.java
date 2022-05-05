package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.BulkTestResultUpload;
import gov.cdc.usds.simplereport.db.model.Organization;
import java.util.Date;
import java.util.List;
import org.springframework.data.domain.Pageable;

public interface UploadRepository extends AuditedEntityRepository<BulkTestResultUpload> {

  List<BulkTestResultUpload> findAllByOrganizationOrderByCreatedAtDesc(Organization o, Pageable p);

  List<BulkTestResultUpload> findAllByOrganizationAndCreatedAtIsAfterOrderByCreatedAtDesc(
      Organization o, Date startDate, Pageable p);

  List<BulkTestResultUpload> findAllByOrganizationAndCreatedAtIsBeforeOrderByCreatedAtDesc(
      Organization o, Date endDate, Pageable p);

  List<BulkTestResultUpload>
      findAllByOrganizationAndCreatedAtIsAfterAndCreatedAtIsBeforeOrderByCreatedAtDesc(
          Organization o, Date startDate, Date endDate, Pageable p);

  int countAllByOrganization(Organization o);
}

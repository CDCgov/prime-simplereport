package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.AuditedEntity;
import java.util.UUID;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.NoRepositoryBean;

@NoRepositoryBean
public interface DeletableEntityRepository<T extends AuditedEntity>
    extends CrudRepository<T, UUID> {}

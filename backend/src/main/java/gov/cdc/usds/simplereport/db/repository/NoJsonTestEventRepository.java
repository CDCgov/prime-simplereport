package gov.cdc.usds.simplereport.db.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.repository.Repository;

import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.readonly.NoJsonTestEvent;

public interface NoJsonTestEventRepository extends Repository<NoJsonTestEvent, UUID> {

	public List<NoJsonTestEvent> findAllByOrganization(Organization o);

}

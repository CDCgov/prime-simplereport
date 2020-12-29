package gov.cdc.usds.simplereport.service;

import java.util.List;

import gov.cdc.usds.simplereport.config.authorization.OrganizationRoles;

@FunctionalInterface
public interface AuthorizationService {

    List<OrganizationRoles> findAllOrganizationRoles();

}
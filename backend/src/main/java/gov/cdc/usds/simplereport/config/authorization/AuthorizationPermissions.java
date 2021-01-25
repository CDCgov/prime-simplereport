package gov.cdc.usds.simplereport.config.authorization;

import java.util.HashMap;
import java.util.ArrayList;

import org.springframework.boot.context.properties.ConfigurationProperties;

import gov.cdc.usds.simplereport.api.model.UserPermission;

@ConfigurationProperties(prefix="simple-report.authorization.permissions")
public class AuthorizationPermissions extends HashMap<UserType, ArrayList<UserPermission>> {
    private static final long serialVersionUID = 1L;
}
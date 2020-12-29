package gov.cdc.usds.simplereport;

import java.util.Collection;
import java.util.Collections;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import gov.cdc.usds.simplereport.config.AuthorizationProperties;
import gov.cdc.usds.simplereport.config.BeanProfiles;
import gov.cdc.usds.simplereport.config.authorization.OrganizationExtractor;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRoles;

@RestController
@Profile(BeanProfiles.AUTHORIZATION_DEV)
public class AuthTestController {

	private static final Logger LOG = LoggerFactory.getLogger(AuthTestController.class);

    private OrganizationExtractor _extractor;

    public AuthTestController(AuthorizationProperties p) {
        _extractor = new OrganizationExtractor(p);
    }

	@GetMapping("/authTest")
	public Object showMe(Authentication auth) {
		LOG.warn("Authentication is of class {}", auth.getClass().getCanonicalName());
		Object principal = auth.getPrincipal();
		LOG.warn("Principal is {}", principal);
		if (principal != null) {
			LOG.warn("Principal class is {}", principal.getClass());
		}
		if (principal instanceof OidcUser) {
			OidcUser user = OidcUser.class.cast(principal);
			LOG.warn("Available attributes are {}", user.getAttributes().keySet());
			return user;
		}
        if (principal instanceof Jwt) {
            return principal;
        }
		return auth;
	}

    @GetMapping("/authTest/orgRoles")
    public List<OrganizationRoles> getRoles(Authentication auth) {
        return _extractor.convert(auth.getAuthorities());
    }

    @GetMapping("/authTest/authorities")
    public Collection<GrantedAuthority> getAuthorities(Authentication auth) {
        return Collections.unmodifiableCollection(auth.getAuthorities());
    }
}

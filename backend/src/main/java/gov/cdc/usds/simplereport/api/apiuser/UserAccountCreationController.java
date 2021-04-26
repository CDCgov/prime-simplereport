package gov.cdc.usds.simplereport.api.apiuser;

import static gov.cdc.usds.simplereport.config.WebConfiguration.USER_ACCOUNT_REQUEST;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpSession;

/** 
 * Controller used for user account creation.
 */
@PreAuthorize("@apiUserService.verifyAccountCreationRequest()")
@RestController
@RequestMapping(USER_ACCOUNT_REQUEST)
public class UserAccountCreationController {
    
    /**
     * Dummy controller that returns the given session id.
     */
    @GetMapping("/")
    String uid(HttpSession session) {
        System.out.println("BOOYAH" + session.getId());
        return session.getId();
    }


    // note: most of the tutorials/guides online specify adding a 
    // WebSecurityConfigurerAdapter to protect unauthorized users from
    // accessing the API.
    // SimpleReport has one (SecurityConfiguration) but that's likely too
    // strict for this use case (since it requires Okta signin)
    // options are going to be either altering that SecurityConfiguration file
    // so that this endpoint isn't covered, or creating a new
    //  SecurityConfiguration just for this
    // the patient experience controller is probably a good example here,
    // since they have to do the same thing

    // ok, PatientExperienceController is definitely a good example to follow
    // they use verifyPatientLink to control access, rather than the more restrictive
    // rules in SecurityConfiguration
    // we probably ? want to do something similar, querying the database to see
    // if an invite has been sent to the given email address
    // that might be a V2 though, since we're not expecting anything right now
    // But: the plan is as follows.
    // - Update the SecurityConfiguration file to allow all traffic to go to UserAccountCreationController
    // - Add some kind of logic here for now to restrict the allowed traffic (emails from DB, maybe?)
    // - add the actual API logic for account creation (password verification, recovery questions, etc)


    // AccountRequestController is handled a little differently: all requests are allowed (I think)
    // "Account requests are unauthorized"
    // I assume this means anyone/anything can send a request to this resource

    // also need to consider what kind of HTTP method this is - probably a POST to Okta
}

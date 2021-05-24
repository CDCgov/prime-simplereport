package gov.cdc.usds.simplereport.idp.authentication;

public class LiveOktaAuthenticationTest {
    // step one here is going to be figuring out how to just run the dang test in the first place.
    // the setup is currently configured not to use the live version for testing, but I frankly don't really remember where I configured that.
    // maybe this is application-dev.yaml?
    // in any case, this is likely going to need a different configuration file than the rest of the the tests, since we only want it to run infrequently.
    // backend/src/test/resources/application-default.yaml
    // Ugh I suspect I'm going to have to write a new yaml file just for integration tests, the one we have in place is for unit testing only (and that's where no-auth is set up)

    // maybe we don't need to go through all this trouble - what if I just made a repository instead?
    // might still need a yaml file to provide all the right Okta links, but that's ok
}

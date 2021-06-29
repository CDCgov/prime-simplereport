package gov.cdc.usds.simplereport.service.idVerification;

import org.springframework.beans.factory.annotation.Autowired;

import gov.cdc.usds.simplereport.properties.ExperianProperties;


public class LiveExperianService {

    private final ExperianProperties _experianProperties;
    
    @Autowired
    public LiveExperianService(final ExperianProperties experianProperties) {
        _experianProperties = experianProperties;
    }

    public String fetchToken() {
        
    }

    // required variables:
    // apigee token endpoint (this is the url we're sending the request to)
    // GUID (it seems like this is just a UUID that we generate)
    // domain: the domain linked to the customer instance
    // email address used for customer's user account
    // password: password for the user account
    // client id: identifier used for regional endpoint
    // client secret: secret for the client id

    /**
     * curl -X POST \
https://<APIGEE_TOKEN_REGIONAL_ENDPOINT> \
-H 'Content-Type: application/json' \
-H 'X-Correlation-Id: <GUID>' \
-H 'X-User-Domain: <DOMAIN>' \
-d '{"username": "<USER@DOMAIN>",
"password": "<PASSWORD>",
"client_id": "<CLIENT_ID>",
"client_secret" : "<CLIENT_SECRET>"}'
     */
}

package gov.cdc.usds.simplereport.api.model;

import gov.cdc.usds.simplereport.api.model.facets.PersonWrapper;
import gov.cdc.usds.simplereport.service.model.UserInfo;
import gov.cdc.usds.simplereport.service.model.WrappedEntity;

public class ApiUserWithStatus extends WrappedEntity<UserInfo> implements PersonWrapper<UserInfo> {
    
    // this might be the righr way to go, but I rather doubt it.
    // I think the superclasses are off - might just need a PersonWrapper 
    // but need to figure out the relationship to WrappedEntity
    // also need to figure out the relationship between graphQL queries and the POJOs behind them
    public ApiUserWithStatus(UserInfo user) {
        super(user);
    }
}

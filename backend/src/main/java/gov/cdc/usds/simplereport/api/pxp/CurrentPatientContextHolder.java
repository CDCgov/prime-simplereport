package gov.cdc.usds.simplereport.api.pxp;

import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.stereotype.Repository;
import org.springframework.web.context.WebApplicationContext;

import gov.cdc.usds.simplereport.db.model.TestOrder;

@Repository
@Scope(scopeName = WebApplicationContext.SCOPE_REQUEST,
        proxyMode = ScopedProxyMode.TARGET_CLASS)
public class CurrentPatientContextHolder {

    private TestOrder _currentLinkedOrder;

    public TestOrder getLinkedOrder() {
        return _currentLinkedOrder;
    }

    public void setLinkedOrder(TestOrder currentLinkedOrder) {
        this._currentLinkedOrder = currentLinkedOrder;
    }
}

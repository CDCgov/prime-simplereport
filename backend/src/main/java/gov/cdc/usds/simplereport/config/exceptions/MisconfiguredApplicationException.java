package gov.cdc.usds.simplereport.config.exceptions;

/**
 * Exception to throw when the application is misconfigured; 
 * should be thrown on startup.
 */
public class MisconfiguredApplicationException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public MisconfiguredApplicationException(String message) {
        super(message);
    }

}

package gov.cdc.usds.simplereport.config.authorization;

public enum OrganizationRole {
    USER("Users"), 
    ADMIN("Admins"); // ?

    private String description;

    private OrganizationRole(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}

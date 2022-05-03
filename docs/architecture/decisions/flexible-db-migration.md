
# Flexible Database Migration

**Date:** 02/2022

**Status:** Accepted


## Context

During the Omicron surge in late 2021 through the beginning of 2022, the volume of daily tests SimpleReport processed increased exponentially. The system frequently alerted on database connection exhaustion errors, as there were not enough available connections to process the number of simultaneous users.
Initial remediation attempts included changing the number of connections requested by the application's connection pool, along with increasing the number of application replicas present at a given point in time. These solutions proved temporary, however, as SimpleReport's rate of adoption continued to outstrip its available capacity.
A more permanent solution was established by changing the SKU of our existing database to increase the fixed number of available connections, along with the available DB-specific compute resources. This still did not solve our issues with connection pool sizing, and required careful management of application replicas to prevent inadvertent connection starvation.
The issue resurfaced as attempts were made to migrate the audit log functionality away from the database, and to Splunk, a third-party log analytics provider.
## Decision

Ultimately, the team decided to move to the Azure Database for PostgreSQL - Flexible Server product.

Movement to the Flexible Server SKU would provide a number of advantages, many of which are covered in [this documentation](https://docs.microsoft.com/en-us/azure/postgresql/flexible-server/overview). Specifically, the following provide the greatest impact to SimpleReport:
- High availability of database instances, ensuring minimal downtime in the event of a datacenter or machine outage.
- Automated patching with a managed maintenance window, ensuring that Azure does not attempt to perform maintenance of our DB during peak SR usage hours
- Rapid scaling and performance management, enabling rapid response to customer demand
- The integration of PgBouncer connection pooling, which increases resource efficiency and minimizes the need for manual connection management

## Consequences
The Flexible DB rollout has helped reduce response time according to the Azure metrics.

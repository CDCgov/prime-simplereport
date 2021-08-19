package gov.cdc.usds.simplereport.service.model.crm;

import static gov.cdc.usds.simplereport.service.model.crm.DynamicsValueMapping.getDefaultValue;
import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import gov.cdc.usds.simplereport.api.model.accountrequest.AccountRequest;
import gov.cdc.usds.simplereport.api.model.accountrequest.OrganizationAccountRequest;
import java.io.IOException;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.util.ResourceUtils;

class AccountRequestDynamicsDataTest {

  ObjectMapper objectMapper = new ObjectMapper();

  @Test
  @DisplayName("Populates organization request fields with default value for missing data")
  void testPopulateOrganizationRequestFields() throws IOException {
    OrganizationAccountRequest organizationAccountRequest =
        objectMapper.readValue(
            ResourceUtils.getFile("classpath:requests/organizationAccountRequest.json"),
            OrganizationAccountRequest.class);

    Map<String, Object> dataMap =
        new AccountRequestDynamicsData(organizationAccountRequest).getDataMap();

    assertThat(dataMap)
        .containsEntry(AccountRequestDynamicsData.BAH_FIRSTNAME_TEXT, "Betty")
        .containsEntry(AccountRequestDynamicsData.BAH_LASTNAME_TEXT, "Edwards")
        .containsEntry(AccountRequestDynamicsData.BAH_EMAILADDRESS_TEXT, "betty@mailinator.com")
        .containsEntry(AccountRequestDynamicsData.BAH_NAME_TEXT, "DFW")
        .containsEntry(
            AccountRequestDynamicsData.BAH_OTHERTESTINGSITE_TEXT, "airport/Transit Station")
        // example Missing data required by dynamics
        .containsEntry(
            AccountRequestDynamicsData.BAH_ORDERINGPROVIDERFIRSTNAME_TEXT, getDefaultValue())
        .containsEntry(
            AccountRequestDynamicsData.BAH_ORDERINGPROVIDERLASTNAME_TEXT, getDefaultValue())
        .containsEntry(AccountRequestDynamicsData.BAH_OTHERWEBBROWSERS_TEXT, getDefaultValue());
  }

  @Test
  @DisplayName("Populates account request fields")
  void testPopulateAccountRequestFields() throws IOException {
    AccountRequest accountRequest =
        objectMapper.readValue(
            ResourceUtils.getFile("classpath:requests/accountRequest.json"), AccountRequest.class);

    Map<String, Object> dataMap = new AccountRequestDynamicsData(accountRequest).getDataMap();

    assertThat(dataMap)
        .containsEntry(AccountRequestDynamicsData.BAH_FIRSTNAME_TEXT, "Adrian")
        .containsEntry(AccountRequestDynamicsData.BAH_LASTNAME_TEXT, "Wilson")
        .containsEntry(AccountRequestDynamicsData.BAH_EMAILADDRESS_TEXT, "adrian@mailinator.com")
        .containsEntry(AccountRequestDynamicsData.BAH_NAME_TEXT, "University of Texas at Arlington")
        .containsEntry(AccountRequestDynamicsData.BAH_OTHERTESTINGSITE_TEXT, "College/University")
        .containsEntry(AccountRequestDynamicsData.BAH_ORDERINGPROVIDERFIRSTNAME_TEXT, "Sawyer")
        .containsEntry(AccountRequestDynamicsData.BAH_ORDERINGPROVIDERLASTNAME_TEXT, "Sears")
        .containsEntry(AccountRequestDynamicsData.BAH_CITY_TEXT, "Arlington");
  }
}

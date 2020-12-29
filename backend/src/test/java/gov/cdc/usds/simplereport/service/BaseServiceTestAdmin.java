package gov.cdc.usds.simplereport.service;

import org.springframework.context.annotation.Import;

import gov.cdc.usds.simplereport.test_util.SliceTestConfigurationAdmin;

@Import(SliceTestConfigurationAdmin.class)
public class BaseServiceTestAdmin<T> extends BaseServiceTest<T> {

}

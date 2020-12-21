package gov.cdc.usds.simplereport.service;

import org.springframework.context.annotation.Import;

import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;

@Import(SliceTestConfiguration.class)
public class BaseServiceTestOrgUser<T> extends BaseServiceTest<T> {

}

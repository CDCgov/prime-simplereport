package gov.cdc.usds.simplereport.service.datasource;

import static gov.cdc.usds.simplereport.service.datasource.QueryCountService.QUERY_COUNT_HOLDER;

import javax.sql.DataSource;
import net.ttddyy.dsproxy.support.ProxyDataSourceBuilder;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.boot.test.context.TestComponent;

@TestComponent
public class DatasourceProxyBeanPostProcessor implements BeanPostProcessor {
  @Override
  public Object postProcessAfterInitialization(Object bean, String beanName) {
    if (bean instanceof DataSource dataSource) {
      return ProxyDataSourceBuilder.create(dataSource).countQuery(QUERY_COUNT_HOLDER).build();
    }
    return bean;
  }
}

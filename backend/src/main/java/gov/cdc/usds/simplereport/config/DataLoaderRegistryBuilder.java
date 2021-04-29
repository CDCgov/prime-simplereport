package gov.cdc.usds.simplereport.config;

import gov.cdc.usds.simplereport.service.dataloader.KeyedDataLoaderFactory;
import java.util.List;
import org.dataloader.DataLoaderRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class DataLoaderRegistryBuilder {
  private final List<KeyedDataLoaderFactory> dataLoaders;
  private final Logger LOG = LoggerFactory.getLogger(DataLoaderRegistryBuilder.class);

  public DataLoaderRegistryBuilder(List<KeyedDataLoaderFactory> dataLoaders) {
    this.dataLoaders = dataLoaders;
    LOG.warn("Init");
  }

  public DataLoaderRegistry build() {
    DataLoaderRegistry registry = new DataLoaderRegistry();
    dataLoaders.forEach(
        dataLoaderFactory -> {
          LOG.warn("Registering {}", dataLoaderFactory.getKey());
          registry.register(dataLoaderFactory.getKey(), dataLoaderFactory.get());
        });
    return registry;
  }
}

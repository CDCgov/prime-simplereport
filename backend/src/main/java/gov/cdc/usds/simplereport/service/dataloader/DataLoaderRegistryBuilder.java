package gov.cdc.usds.simplereport.service.dataloader;

import java.util.List;
import org.dataloader.DataLoaderRegistry;
import org.springframework.stereotype.Component;

/**
 * Aggregates all of te KeyedDataLoaderFactories that are registered with the Dependency Injector
 * into a List, and uses that List to supply DataLoaderRegistries with all of those DataLoaders
 * already registered to them.
 */
@Component
public class DataLoaderRegistryBuilder {
  private final List<KeyedDataLoaderFactory<?, ?>> dataLoaders;

  public DataLoaderRegistryBuilder(List<KeyedDataLoaderFactory<?, ?>> dataLoaders) {
    this.dataLoaders = dataLoaders;
  }

  public DataLoaderRegistry build() {
    DataLoaderRegistry registry = new DataLoaderRegistry();
    dataLoaders.forEach(
        dataLoaderFactory ->
            registry.register(dataLoaderFactory.getKey(), dataLoaderFactory.get()));
    return registry;
  }
}

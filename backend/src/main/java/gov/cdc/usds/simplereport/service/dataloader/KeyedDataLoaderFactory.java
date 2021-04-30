package gov.cdc.usds.simplereport.service.dataloader;

import org.dataloader.BatchLoader;
import org.dataloader.DataLoader;

/**
 * The DataLoaderRegistryBuilder will receive an injected List of KeyedDataLoaderFactories, and each
 * time it builds a new DataLoaderRegistry it will use the factories to new up a DataLoader of each
 * type that needs to be registered. In order for them to be get and set, they also have to be aware
 * of their key.
 */
abstract class KeyedDataLoaderFactory<K, V> {
  private final BatchLoader<K, V> batchLoadFunction;

  KeyedDataLoaderFactory(BatchLoader<K, V> batchLoadFunction) {
    this.batchLoadFunction = batchLoadFunction;
  }

  public DataLoader<K, V> get() {
    return new DataLoader<>(batchLoadFunction);
  }

  public abstract String getKey();
}

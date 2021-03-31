package gov.cdc.usds.simplereport.service.model;

/** Base interface for wrapper objects, to allow consistent mixin/facet design. */
public interface Wrapper<T> {

  T getWrapped();
}

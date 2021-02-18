package gov.cdc.usds.simplereport.api.model.pxp;

import java.time.LocalDate;

public class PxpApiWrapper<T> {
  private String plid;
  private LocalDate dob;
  private T data;

  public PxpApiWrapper() {
  }

  public PxpApiWrapper(String id) {
    plid = id;
  }

  public PxpApiWrapper(String id, LocalDate dob) {
    plid = id;
    this.dob = dob;
  }

  public PxpApiWrapper(String id, LocalDate dob, T data) {
    plid = id;
    this.dob = dob;
    this.data = data;
  }

  public String getPlid() {
    return plid;
  }

  public void setPlid(String plid) {
    this.plid = plid;
  }

  public LocalDate getDob() {
    return dob;
  }

  public void setDob(LocalDate dob) {
    this.dob = dob;
  }

  public T getData() {
    return data;
  }

  public void setData(T data) {
    this.data = data;
  }
}

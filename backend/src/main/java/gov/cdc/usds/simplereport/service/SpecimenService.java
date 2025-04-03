package gov.cdc.usds.simplereport.service;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
@Slf4j
public class SpecimenService {

 public String syncSpecimens(){
   return "Sync specimens!";
 }
}

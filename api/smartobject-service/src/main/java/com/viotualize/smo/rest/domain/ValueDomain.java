package com.viotualize.smo.rest.domain;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.JsonTypeInfo.Id;
import com.fasterxml.jackson.annotation.JsonTypeInfo.As;

@JsonTypeInfo(use=Id.NAME, include=As.PROPERTY, property="type")
@JsonSubTypes({
  @JsonSubTypes.Type(value=RangeValueDomain.class, name="range"),
  @JsonSubTypes.Type(value=FixedValueDomain.class, name="fixed")
}) 
abstract class ValueDomain {

	
}

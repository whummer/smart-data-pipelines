package com.viotualize.core.domain;

import java.util.Iterator;

/**
 * Represents the value domain of some value, e.g., a {@link Property}.
 * 
 * Iff the domain size is infinite, getDomainSize() returns null.
 * 
 * Iff the domain size is infinite, iterateValues() returns an empty iterator.
 * 
 * @author Waldemar Hummer
 */
public abstract class ValueDomain<BaseType> {

	public abstract Long getDomainSize();

	public abstract Iterator<BaseType> iterateValues();
}

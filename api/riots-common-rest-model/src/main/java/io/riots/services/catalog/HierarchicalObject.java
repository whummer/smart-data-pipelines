package io.riots.services.catalog;

import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

/**
 * @author omoser
 * @author whummer
 */
public abstract class HierarchicalObject<T> {

	@JsonInclude(Include.NON_EMPTY)
	protected String name;

	@JsonInclude(Include.NON_EMPTY)
	Set<T> children = new HashSet<>();

	public HierarchicalObject() {
	}

	public HierarchicalObject(String name) {
		setName(name);
	}

	@SuppressWarnings("unchecked")
	public T addChild(T child) {
		children.add(child);
		return (T) this;
	}

	public Set<T> getChildren() {
		return children;
	}

	public void setChildren(Set<T> children) {
		this.children = children;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public HierarchicalObject withName(final String name) {
		this.name = name;
		return this;
	}

	public HierarchicalObject withChildren(final Set<T> children) {
		this.children = children;
		return this;
	}


}

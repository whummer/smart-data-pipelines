package io.riots.catalog.model;

import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

/**
 * @author omoser
 * @author whummer
 */
public abstract class HierarchicalObjectElastic<T extends HierarchicalObjectElastic<T>> {

	@JsonInclude(Include.NON_EMPTY)
	private String name;

	@JsonInclude(Include.NON_EMPTY)
	Set<T> children = new HashSet<>();

	public HierarchicalObjectElastic() {
	}

	public HierarchicalObjectElastic(String name) {
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

}

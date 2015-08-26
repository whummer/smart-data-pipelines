package io.riots.api.services.catalog;

import io.riots.api.services.model.interfaces.ObjectNamed;

import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

/**
 * @author omoser
 * @author whummer
 */
public abstract class HierarchicalObject<T> implements ObjectNamed {

	@JsonInclude(Include.NON_EMPTY)
	protected String name;

	@JsonInclude(Include.NON_EMPTY)
	Set<T> children = new HashSet<>();

	public HierarchicalObject() {
	}

	public HierarchicalObject(String name) {
		setName(name);
	}

	public void addChild(T child) {
		children.add(child);
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

	public HierarchicalObject<?> withName(final String name) {
		this.name = name;
		return this;
	}

	public HierarchicalObject<?> withChildren(final Set<T> children) {
		this.children = children;
		return this;
	}


}
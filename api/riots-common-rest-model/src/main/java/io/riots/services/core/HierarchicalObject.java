package io.riots.services.core;

import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

/**
 * @author omoser
 * @author whummer
 */
public abstract class HierarchicalObject<T extends HierarchicalObject<T>> extends BaseObject<T> {

	@JsonInclude(Include.NON_EMPTY) 
    Set<T> children = new HashSet<>();

    public HierarchicalObject() {
        super();
    }
    public HierarchicalObject(String name) {
        super(name);
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

}

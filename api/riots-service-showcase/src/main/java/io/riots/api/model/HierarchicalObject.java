package io.riots.api.model;

import io.riots.core.util.cascade.CascadeSave;

import java.util.HashSet;
import java.util.Set;

import org.springframework.data.mongodb.core.mapping.DBRef;

/**
 * @author omoser
 * @author whummer
 */
@SuppressWarnings("unchecked")
public abstract class HierarchicalObject<T extends HierarchicalObject<T>> extends BaseObjectCreated<T> {

    @DBRef
    @CascadeSave
    Set<T> children = new HashSet<>();

    public HierarchicalObject() {
        super();
    }
    public HierarchicalObject(String name) {
        super(name);
    }

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

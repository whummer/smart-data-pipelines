package com.viotualize.core.model;

import java.util.HashSet;
import java.util.Set;

import org.springframework.data.mongodb.core.mapping.DBRef;


/**
 * @author omoser
 */
@SuppressWarnings("unchecked")
// todo is this object "smart"? Should we rename it to "HierarchicalObject"
// TODO whu: I am in favor of renaming to "HierarchicalObject", or rather "CompositeObject"
public abstract class CompositeObject<T extends CompositeObject<T>> extends BaseObject<T> {

    @DBRef
    Set<T> children = new HashSet<>();

    public CompositeObject() {
        super();
    }
    public CompositeObject(String name) {
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

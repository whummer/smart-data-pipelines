package com.viotualize.core.domain;

import java.util.HashSet;
import java.util.Set;

import org.springframework.data.mongodb.core.mapping.DBRef;

import com.viotualize.core.util.cascade.CascadeSave;

/**
 * @author omoser
 */
@SuppressWarnings("unchecked")
// todo is this object "smart"? Should we rename it to "HierarchicalObject"
// TODO whu: I am in favor of renaming to "HierarchicalObject", or rather "CompositeObject"
public abstract class SmartObject<T extends SmartObject<T>> extends BaseObjectCreated<T> {

    @DBRef
    @CascadeSave
    Set<T> children = new HashSet<>();

    public SmartObject() {
        super();
    }
    public SmartObject(String name) {
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

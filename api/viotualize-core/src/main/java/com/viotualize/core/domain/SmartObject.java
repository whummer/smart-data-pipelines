package com.viotualize.core.domain;

import org.springframework.data.mongodb.core.mapping.DBRef;

import java.util.HashSet;
import java.util.Set;

/**
 * @author omoser
 */
@SuppressWarnings("unchecked")
// todo is this object "smart"? Should we rename it to "HierarchicalObject"
public abstract class SmartObject<T> extends BaseObject<T> {

    @DBRef
    Set<T> children = new HashSet<>();

    protected SmartObject(String name) {
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

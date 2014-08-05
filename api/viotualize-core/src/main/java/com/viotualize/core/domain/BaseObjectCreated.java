package com.viotualize.core.domain;

import java.util.Date;

import org.springframework.data.annotation.CreatedDate;

/**
 * @author Waldemar Hummer
 */
@SuppressWarnings("unchecked")
public abstract class BaseObjectCreated<T> extends BaseObject<T> {

    @CreatedDate
    Date created;

    User creator;

    protected BaseObjectCreated() {}
    protected BaseObjectCreated(String name) {
       super(name);
        created = new Date();
    }

    public Date getCreated() {
        return created;
    }

    public T withCreated(final Date created) {
        this.created = created;
        return (T) this;
    }

    public void setCreated(Date created) {
        this.created = created;
    }

    public User getCreator() {
		return creator;
	}

    public T withCreator(final User creator) {
        this.creator = creator;
        return (T) this;
    }

    public void setCreator(User creator) {
		this.creator = creator;
	}

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof BaseObject)) return false;

        BaseObjectCreated<T> that = (BaseObjectCreated<T>) o;

        if (!super.equals(that)) return false;
        if (created != null ? !created.equals(that.created) : that.created != null) return false;

        return true;
    }

    @Override
    public int hashCode() {
        int result = super.hashCode();
        result = 31 * result + (created != null ? created.hashCode() : 0);
        return result;
    }
}

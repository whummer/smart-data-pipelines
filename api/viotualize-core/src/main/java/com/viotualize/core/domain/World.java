package com.viotualize.core.domain;

import org.springframework.data.mongodb.core.mapping.Document;


/**
 * Represents a world.
 * 
 * Worlds are composable, i.e., a world may contain and consist of a set of
 * worlds.
 * 
 * A world is either 1) global, or 2) local if it belongs to a specific user. 
 * 
 * @author Waldemar Hummer
 */
@Document(collection = Constants.COLL_WORLDS)
public class World extends SmartObject<World> {

	private User owner;

	public World(String name) {
		super(name);
	}

	public User getOwner() {
		return owner;
	}

	public void setOwner(User owner) {
		this.owner = owner;
	}
}

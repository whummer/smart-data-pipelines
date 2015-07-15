package io.riots.api.services.model;

import io.riots.api.services.scenarios.Thing;

import java.util.LinkedList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * DB class for {@link Thing}.
 * @author hummer
 */
@Document(collection = Constants.COLL_THINGS)
public class ThingMongo extends Thing {

	public Thing convert() {
		Thing t = new Thing();
		copy(this, t);
		return t;
	}

	public static ThingMongo convert(Thing thing) {
		ThingMongo m = new ThingMongo();
		copy(thing, m);
		return m;
	}

	public static void copy(Thing from, Thing to) {
		to.setId(from.getId());
		to.setThingTypeId(from.getThingTypeId());
		to.setCreated(from.getCreated());
		to.setCreatorId(from.getCreatorId());
		to.setLocation(from.getLocation());
		to.setName(from.getName());
		to.setChildren(from.getChildren());
		to.setGeometry(from.getGeometry());
	}

	@Id
	public String getId() {
		return super.getId();
	}

	public static List<Thing> convert(List<ThingMongo> list) {
		List<Thing> result = new LinkedList<Thing>();
		for(ThingMongo m : list) {
			result.add(m.convert());
		}
		return result;
	}

}

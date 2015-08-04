package io.riots.core.mongodb.cascade;

import java.lang.reflect.Field;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.lang.reflect.TypeVariable;
import java.util.Collection;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.annotation.Id;
import org.springframework.data.mapping.model.MappingException;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.event.AbstractMongoEventListener;
import org.springframework.util.ReflectionUtils;

/**
 * Based on:
 * http://maciejwalkowiak.pl/blog/2012/04/30/spring-data-mongodb-cascade-save-on-dbref-objects/ https://github.com/spring-projects/spring-data-mongodb/pull/3
 */
@SuppressWarnings("all")
public class CascadingMongoEventListener extends AbstractMongoEventListener {

	@Autowired
	private MongoOperations mongoOperations;

	@Override
	public void onBeforeConvert(final Object source) {
		ReflectionUtils.doWithFields(source.getClass(),
				new ReflectionUtils.FieldCallback() {

					public void doWith(Field field)
							throws IllegalArgumentException,
							IllegalAccessException {
						ReflectionUtils.makeAccessible(field);

						if (field.isAnnotationPresent(DBRef.class)
								&& field.isAnnotationPresent(CascadeSave.class)) {
							final Object fieldValue = field.get(source);
							if (fieldValue != null) {

								Class fieldClass = fieldValue.getClass();
								if (Collection.class.isAssignableFrom(field.getType())) {
									ParameterizedType t = (ParameterizedType)
								        	fieldClass.getGenericSuperclass();
									Type type = t.getActualTypeArguments()[0];
									if(type instanceof Class) {
										fieldClass = (Class)type;
									} else {
										fieldClass = (Class)((TypeVariable)type).getBounds()[0];
										
									}
//									System.out.println(fieldClass);
								}

								if(fieldClass != Object.class) {
									DbRefFieldCallback callback = new DbRefFieldCallback();
									ReflectionUtils.doWithFields(fieldClass,
											callback);
									if (!callback.isIdFound()) {
										throw new MappingException(
												"Cannot perform cascade save on child object without id set");
									}
								}

								if (Collection.class.isAssignableFrom(field
										.getType())) {
									@SuppressWarnings("unchecked")
									Collection<Object> models = (Collection<Object>) fieldValue;
									for (Object model : models) {
										mongoOperations.save(model);
									}
								} else {
									mongoOperations.save(fieldValue);
								}
							}
						}

					}
				});
	}

	private static class DbRefFieldCallback implements
			ReflectionUtils.FieldCallback {
		private boolean idFound;

		public void doWith(Field field) throws IllegalArgumentException,
				IllegalAccessException {
			ReflectionUtils.makeAccessible(field);

			if (field.isAnnotationPresent(Id.class)) {
				idFound = true;
			}
		}

		public boolean isIdFound() {
			return idFound;
		}
	}
}

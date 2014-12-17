package com.viotualize.core.scripting;

//TODO remove class??

//import groovy.lang.MetaClass;
//import groovy.util.Expando;
//
//import java.lang.reflect.Field;
//import java.util.Collection;
//import java.util.HashSet;
//import java.util.LinkedList;
//import java.util.List;
//import java.util.Set;
//
//import javafx.util.Pair;
//
//import org.apache.commons.lang3.reflect.FieldUtils;
//
//import com.google.common.collect.ImmutableMap;
//
//public class EntityWrapper extends Expando {
//	Object wrapped;
//	public EntityWrapper(Object wrapped) {
//		this.wrapped = wrapped;
//	}
//	public Object propertyMissing(String name) {
//		//System.out.println("Missing property '" + name + "' for class " + wrapped.getClass());	
//		Object val;
//		try {
//			if(wrapped == null) {
//				return null;
//			}
//			Pair<Object,Field> objectField = findField(wrapped, name);
//			objectField.getValue().setAccessible(true);
//			val = objectField.getValue().get(objectField.getKey());
//			return val;
//		} catch (Exception e) {
//			throw new RuntimeException(e);
//		}
//	}
//	private Pair<Object,Field> findField(Object obj, String name) {
//		Field f = FieldUtils.getField(wrapped.getClass(), name, true);
//		if(f == null) {
//			/* check if there is a mapping redirection */
//			List<Pair<String,String>> mappings = getAllFieldMappings();
//			System.out.println(mappings);
//			for(Pair<String,String> mapping : mappings) {
//				String lhs = ScriptingEngine.exec(
//						"\"" + mapping.getKey() + "\"",
//						ImmutableMap.of("name", name)).toString();
//				if(name.matches(lhs)) {
//					String rhs = (String)ScriptingEngine.exec(
//							"\"" + mapping.getValue() + "\"",
//							ImmutableMap.of("name", name)).toString();
//					System.out.println(lhs);
//					System.out.println(rhs);
//				}
//			}
//
//			throw new RuntimeException("No such property: " + wrapped.getClass().getSimpleName() + "." + name);
//		}
//		ScriptingAccess access = f.getAnnotation(ScriptingAccess.class);
//		if(access == null || !access.read()) {
//			throw new RuntimeException("No such property: " + wrapped.getClass().getSimpleName() + "." + name);
//		}
//		return new Pair<Object,Field>(obj, f);
//	}
//	private List<Pair<String,String>> getAllFieldMappings() {
//		List<Pair<String,String>> result = new LinkedList<>();
//		for(Field f : FieldUtils.getAllFields(wrapped.getClass())) {
//			ScriptingAccess access = f.getAnnotation(ScriptingAccess.class);
//			if(access != null && access.read() && access.mappings().length > 0) {
//				for(String mapping : access.mappings()) {
//					String lhs = mapping.split("->")[0].trim();
//					String rhs = mapping.split("->")[1].trim();
//					result.add(new Pair<String,String>(lhs, rhs));
//				}
//			}
//		}
//		return result;
//	}
//	@Override
//	public void setProperty(String property, Object newValue) {
//		// disallow this operation (read-only wrapper)
//		System.out.println("set prop: " + property);
//		Pair<Object,Field> field = findField(wrapped, property);
//	}
//	public void setMetaClass(MetaClass metaClass) {
//		// disallow this operation (read-only wrapper)
//	}
//	public Object getProperty(String property) {
//		Object prop = super.getProperty(property);
//		prop = wrapIfNecessary(prop);
//		return prop;
//	}
//	private Object wrapIfNecessary(Object obj) {
//		if(obj == null || obj instanceof String || 
//				obj instanceof Long || 
//				obj instanceof Integer) {
//			return obj;
//		}
//		if(obj instanceof Collection<?>) {
//			Collection<Object> copy = null;
//			if(obj instanceof List<?>)
//				copy = new LinkedList<>();
//			else if(obj instanceof Set<?>)
//				copy = new HashSet<>();
//			for(Object o : (Collection<?>)obj) {
//				copy.add(wrapIfNecessary(o));
//			}
//			return copy;
//		}
//		return new EntityWrapper(obj);
//	}
//	public String toString() {
//		//return "";
//		return wrapped == null ? null : wrapped.toString();
//	}
//
//	@Override
//	public int hashCode() {
//		int result = ((wrapped == null) ? 0 : wrapped.hashCode());
//		return result;
//	}
//	@Override
//	public boolean equals(Object obj) {
//		if (this == obj)
//			return true;
//		if (getClass() != obj.getClass())
//			return false;
//		EntityWrapper other = (EntityWrapper) obj;
//		if (wrapped == null) {
//			if (other.wrapped != null)
//				return false;
//		} else if (!wrapped.equals(other.wrapped))
//			return false;
//		return true;
//	}
//}


package com.viotualize.core.util;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.builder.EqualsBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;
import org.springframework.stereotype.Component;
import org.springframework.test.context.ContextConfiguration;

import com.owlike.genson.Genson;
import com.viotualize.core.domain.AssetCategory;
import com.viotualize.core.domain.Role;
import com.viotualize.core.domain.SmartObject;
import com.viotualize.core.domain.User;
import com.viotualize.core.repositories.AssetCategoryRepository;
import com.viotualize.core.repositories.BaseObjectRepository;
import com.viotualize.core.repositories.DeviceRepository;
import com.viotualize.core.repositories.RoleRepository;
import com.viotualize.core.repositories.UserRepository;

@Component
@ContextConfiguration(locations = "classpath*:viotualize-mongodb-config.xml")
public class PredefinedData {

    @Autowired
    AssetCategoryRepository assetCatRepo;
    @Autowired
    DeviceRepository deviceRepo;
    @Autowired
    RoleRepository roleRepo;
    @Autowired
    UserRepository userRepo;

	Map<Class<?>,BaseObjectRepository<?>> repos;

	public Map<Class<?>, BaseObjectRepository<?>> getRepos() {
		repos = new HashMap<>();
		repos.put(Role.class, roleRepo);
		repos.put(User.class, userRepo);
		repos.put(AssetCategory.class, assetCatRepo);
		return repos;
	}

	@SuppressWarnings("all")
	public static void initDB() {
		try {
			/* ADD DEFAULT ENTRIES TO DB (read from "/predefined.json") */

			PredefinedData p = new PredefinedData();
			ApplicationContext context = new ClassPathXmlApplicationContext(
					"viotualize-mongodb-config.xml");
			context.getAutowireCapableBeanFactory().autowireBean(p);
			p.getRepos();

			Genson g = new Genson();
			List<Object> json = g.deserialize(
					DBUtil.class.getResourceAsStream(
							"/predefined.json"), List.class);
			Map<Class<?>,Map<String,Object>> instances = new HashMap<>();
			for(Object entry : json) {
				Map<String,Object> map = (Map<String,Object>)entry;
				//System.out.println(map);
				for(String className : map.keySet()) {
					Class<?> clazz = Class.forName(className);
					if(!instances.containsKey(clazz)) {
						instances.put(clazz, new HashMap<String,Object>());
					}
					Object[] objects = (Object[])map.get(className);
					for(Object obj : objects) {
						//System.out.println(g.serialize(obj));
						Object instance = g.deserialize(g.serialize(obj), clazz);
						if(instance instanceof AssetCategory) {
							AssetCategory cat = fromJsonRecursive(
									g.serialize(obj), AssetCategory.class);
							cat = p.ensureExistence(cat, "id");
							instances.get(clazz).put(cat.getName(), cat);
							//System.out.println(cat);
						} else if(instance instanceof Role) {
							Role role = (Role)instance;
							role = p.ensureExistence(role);
							instances.get(clazz).put(role.getName(), role);
							//System.out.println(role);
						} else if(instance instanceof User) {
							User user = (User)instance;
							Object[] roles = (Object[])((Map)obj).get("roles");
							for(Object role : roles) {
								user.getRoles().add((Role)instances.get(Role.class).get(role.toString()));
							}
							user = p.ensureExistence(user, "id");
							instances.get(clazz).put(user.getName(), user);
							//System.out.println(user);
						}
					}
				}
			}
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	@SuppressWarnings("unchecked")
	public static <T extends SmartObject<T>> T fromJsonRecursive(String json, Class<T> clazz) {
		Genson g = new Genson();
		T result = g.deserialize(json, clazz);
		Map<String,Object> map = g.deserialize(json, Map.class);
		if(map.get("children") != null) {
			for(Object o : (Object[])map.get("children")) {
				T child = fromJsonRecursive(g.serialize(o), clazz);
				result.getChildren().add(child);
			}
		}
		return result;
	}

	private <T> T ensureExistence(T o) {
		return ensureExistence(o, new String[0]);
	}

	private <T> T ensureExistence(T o, String ... ignoredProperties) {
		System.out.println(repos);
		@SuppressWarnings("unchecked")
		BaseObjectRepository<T> repo = (BaseObjectRepository<T>)repos.get(o.getClass());
		if(repo != null) {
			// TODO: whu: use query instead of iterating all entities)
			for(T existing : repo.findAll()) {
				if(EqualsBuilder.reflectionEquals(o, existing, ignoredProperties)) {
					return existing;
				}
			}
			try {
				return repo.save(o);
			} catch (Exception e) {
				throw new RuntimeException("Unable to save entity " + o, e);
			}
		} else {
			throw new RuntimeException("Unsupported type: " + o.getClass());
		}
	}

	public static void main(String[] args) {
		initDB();
	}
}

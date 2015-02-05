package io.riots.services;

import io.riots.boot.starters.CatalogServiceStarter;
import io.riots.boot.starters.EnvironmentServiceStarter;
import io.riots.boot.starters.FilesServiceStarter;
import io.riots.boot.starters.GatewayServiceStarter;
import io.riots.boot.starters.RiotsServiceRegistryStarter;
import io.riots.boot.starters.SimulationServiceStarter;
import io.riots.boot.starters.UsersServiceStarter;
import io.riots.boot.starters.WebappServiceStarter;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;

import com.google.common.base.Joiner;

public class AllServicesStarter {

	private static final List<Process> PROCESSES = new LinkedList<Process>();

	public static void main(String[] args) throws Exception {
		for(Class<?> clazz : Arrays.asList(
				RiotsServiceRegistryStarter.class,
				GatewayServiceStarter.class,
				CatalogServiceStarter.class,
				UsersServiceStarter.class,
				EnvironmentServiceStarter.class
//				, SimulationServiceStarter.class
//				, FilesServiceStarter.class
//				WebappServiceStarter.class,
		)) {
			start(clazz);
		}
	}

	private static String getClasspath(Class<?> clazz) throws Exception {
		String file = clazz.getName() + ".classpath";
		if (new File(file).exists()) {
			return IOUtils.toString(new FileInputStream(file));
		}
		String dir = System.getProperty("user.dir") + "/../../api/";
		if (clazz == CatalogServiceStarter.class) {
			dir += "riots-service-catalog";
		} else if (clazz == UsersServiceStarter.class) {
			dir += "riots-service-users";
		} else if (clazz == EnvironmentServiceStarter.class) {
			dir += "riots-service-environment";
		} else if (clazz == SimulationServiceStarter.class) {
			dir += "riots-service-simulation";
		} else if (clazz == RiotsServiceRegistryStarter.class) {
			dir += "riots-service-registry";
		} else if (clazz == GatewayServiceStarter.class) {
			dir += "riots-service-gateway";
		} else if (clazz == FilesServiceStarter.class) {
			dir += "riots-service-files";
		} else if (clazz == WebappServiceStarter.class) {
			dir += "riots-webapp";
		} else {
			throw new IllegalArgumentException("Unexpected class: " + clazz);
		}
		String cp = getClasspath(dir);
		if (!StringUtils.isEmpty(cp)) {
			IOUtils.write(cp, new FileOutputStream(file));
		}
		return cp;
	}

	private static String getClasspath(String projectDir) throws Exception {
		String cmd = "cd " + projectDir + " && mvn dependency:build-classpath";
		System.out.println(cmd);
		ProcessBuilder b = new ProcessBuilder("/bin/bash", "-c", cmd);
		Process p = b.start();
		PROCESSES.add(p);
		p.waitFor();
		String s = IOUtils.toString(p.getInputStream());
		boolean isNextLine = false;
		for (String line : s.split("\\n")) {
			if (isNextLine) {
				line = projectDir + "/target/classes:" + line;
				return line;
			}
			if (line.contains("Dependencies classpath:")) {
				isNextLine = true;
			}
		}
		return null;
	}

	private static void start(final Class<?> clazz) throws Exception {
		new Thread() {
			public void run() {
				try {
					while (true) {
						String cp = getClasspath(clazz);
						String[] command = new String[]{
								"java", "-cp", cp, clazz.getName()};
						System.out.println(Joiner.on(" ").join(command));
						/* (re-)start the process. */
						ProcessBuilder b = new ProcessBuilder(command);
						b.redirectErrorStream(true);
						b.redirectOutput(ProcessBuilder.Redirect.INHERIT);
						Process p = b.inheritIO().start();
						int i = p.waitFor();
						System.out.println("Exit code: " + i + " - " + clazz);
					}
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
		}.start();
	}

}

package io.riots.model.serialize;

import io.riots.services.catalog.Property;
import io.riots.services.sim.PropertySimulation;
import io.riots.services.sim.Simulation;

import org.testng.annotations.Test;

public class TestSerialization {

	@Test
	public void testSimulation() throws Exception {

		com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();

		System.out.println(mapper.readValue("{\"name\":\"unnamed\",\"baseType\":\"STRING\"}",Property.class));

		String value = "{\"type\": \"RANDOM\", "
				//+ "\"stepInterval\": 1, "
				+ "\"minValue\": 10, \"maxValue\": 20}, \"startTime\": 0, \"endTime\": 10}";
		PropertySimulation<?> r1 = mapper.readValue(value, PropertySimulation.class);
		System.out.println(r1);

		value = "{\"id\":\"5415da2bc02683f7c1770568\",\"name\":\"scenario3\",\"description\":null,\"properties\":{},\"created\":null,\"creator\":null,\"devices\":[{\"type\":\"GROUP\",\"id\":\"0407818e-6669-4fb8-aba0-2fb323cec461\",\"name\":\"foo\",\"description\":null,\"properties\":{},\"created\":null,\"creator\":null,\"deviceType\":{\"id\":\"5414b9aac026926e3bdec66d\",\"name\":\"unnamed 1\",\"description\":null,\"properties\":{},\"created\":null,\"creator\":null,\"children\":[],\"manufacturer\":null,\"type\":null,\"deviceProperties\":[{\"baseType\":\"LIST\",\"id\":\"5414fbcbc0266d9693092e74\",\"name\":\"location\",\"description\":null,\"properties\":{},\"created\":null,\"creator\":null,\"children\":[{\"baseType\":\"DOUBLE\",\"id\":\"5415097ec0266d9693092e81\",\"name\":\"lon\",\"description\":null,\"properties\":{},\"created\":null,\"creator\":null,\"children\":[],\"metadata\":{\"sensable\":null,\"actuatable\":null},\"constraints\":null,\"valueDomain\":null,\"semanticType\":\"LOCATION_LON\"},{\"baseType\":\"DOUBLE\",\"id\":\"54150e6ac0266d9693092e83\",\"name\":\"lat\",\"description\":null,\"properties\":{},\"created\":null,\"creator\":null,\"children\":[],\"metadata\":{\"sensable\":null,\"actuatable\":null},\"constraints\":null,\"valueDomain\":null,\"semanticType\":\"LOCATION_LAT\"}],\"metadata\":{\"sensable\":null,\"actuatable\":null},\"constraints\":null,\"valueDomain\":null,\"semanticType\":\"LOCATION\"},{\"baseType\":\"STRING\",\"id\":\"5414ff61c0266d9693092e76\",\"name\":\"t1\",\"description\":null,\"properties\":{},\"created\":null,\"creator\":null,\"children\":[],\"metadata\":{\"sensable\":null,\"actuatable\":null},\"constraints\":null,\"valueDomain\":null,\"semanticType\":\"__NONE__\"}]},\"numInstances\":10},{\"type\":\"GROUP\",\"id\":\"0d4a28e4-29b7-4bc5-9388-d06b488eed28\",\"name\":\"bar\",\"description\":null,\"properties\":{},\"created\":null,\"creator\":null,\"deviceType\":{\"id\":\"5414c5a0c026926e3bdec66e\",\"name\":\"unnamed\",\"description\":null,\"properties\":{},\"created\":null,\"creator\":null,\"children\":[],\"manufacturer\":null,\"type\":null,\"deviceProperties\":[]},\"numInstances\":0}],\"simulationProperties\":[],\"constraints\":[{\"type\":\"EXPRESSION\",\"expression\":\"\"}]}";
		value = "{\"id\":\"541782f8c0265048194bdd37\",\"name\":\"Unnamed Scenario\",\"description\":null,\"properties\":{},\"created\":null,\"creator\":null,\"devices\":[{\"type\":\"GROUP\",\"id\":\"541782fac0265048194bdd38\",\"name\":\"unnamed\",\"description\":null,\"properties\":{},\"created\":null,\"creator\":null,\"deviceType\":{\"id\":\"5414b9aac026926e3bdec66d\",\"name\":\"unnamed 1\",\"description\":null,\"properties\":{},\"created\":null,\"creator\":null,\"children\":[],\"manufacturer\":null,\"type\":null,\"deviceProperties\":[{\"baseType\":\"LIST\",\"id\":\"5414fbcbc0266d9693092e74\",\"name\":\"location\",\"description\":null,\"properties\":{},\"created\":null,\"creator\":null,\"children\":[{\"baseType\":\"DOUBLE\",\"id\":\"5415097ec0266d9693092e81\",\"name\":\"lon\",\"description\":null,\"properties\":{},\"created\":null,\"creator\":null,\"children\":[],\"metadata\":{\"sensable\":null,\"actuatable\":null},\"constraints\":null,\"valueDomain\":null,\"semanticType\":\"LOCATION_LON\"},{\"baseType\":\"DOUBLE\",\"id\":\"54150e6ac0266d9693092e83\",\"name\":\"lat\",\"description\":null,\"properties\":{},\"created\":null,\"creator\":null,\"children\":[],\"metadata\":{\"sensable\":null,\"actuatable\":null},\"constraints\":null,\"valueDomain\":null,\"semanticType\":\"LOCATION_LAT\"}],\"metadata\":{\"sensable\":null,\"actuatable\":null},\"constraints\":null,\"valueDomain\":null,\"semanticType\":\"LOCATION\"},{\"baseType\":\"STRING\",\"id\":\"5414ff61c0266d9693092e76\",\"name\":\"t1\",\"description\":null,\"properties\":{},\"created\":null,\"creator\":null,\"children\":[],\"metadata\":{\"sensable\":null,\"actuatable\":null},\"constraints\":null,\"valueDomain\":null,\"semanticType\":\"__NONE__\"}]},\"numInstances\":0}],\"simulationProperties\":[{\"type\":\"RANDOM\",\"id\":\"54178304c0265048194bdd39\",\"name\":\"t1\",\"description\":null,\"properties\":{},\"created\":null,\"creator\":null,\"property\":null,\"device\":{\"type\":\"GROUP\",\"id\":\"541782fac0265048194bdd38\",\"name\":\"unnamed\",\"description\":null,\"properties\":{},\"created\":null,\"creator\":null,\"deviceType\":{\"id\":\"5414b9aac026926e3bdec66d\",\"name\":\"unnamed 1\",\"description\":null,\"properties\":{},\"created\":null,\"creator\":null,\"children\":[],\"manufacturer\":null,\"type\":null,\"deviceProperties\":[{\"baseType\":\"LIST\",\"id\":\"5414fbcbc0266d9693092e74\",\"name\":\"location\",\"description\":null,\"properties\":{},\"created\":null,\"creator\":null,\"children\":[{\"baseType\":\"DOUBLE\",\"id\":\"5415097ec0266d9693092e81\",\"name\":\"lon\",\"description\":null,\"properties\":{},\"created\":null,\"creator\":null,\"children\":[],\"metadata\":{\"sensable\":null,\"actuatable\":null},\"constraints\":null,\"valueDomain\":null,\"semanticType\":\"LOCATION_LON\"},{\"baseType\":\"DOUBLE\",\"id\":\"54150e6ac0266d9693092e83\",\"name\":\"lat\",\"description\":null,\"properties\":{},\"created\":null,\"creator\":null,\"children\":[],\"metadata\":{\"sensable\":null,\"actuatable\":null},\"constraints\":null,\"valueDomain\":null,\"semanticType\":\"LOCATION_LAT\"}],\"metadata\":{\"sensable\":null,\"actuatable\":null},\"constraints\":null,\"valueDomain\":null,\"semanticType\":\"LOCATION\"},{\"baseType\":\"STRING\",\"id\":\"5414ff61c0266d9693092e76\",\"name\":\"t1\",\"description\":null,\"properties\":{},\"created\":null,\"creator\":null,\"children\":[],\"metadata\":{\"sensable\":null,\"actuatable\":null},\"constraints\":null,\"valueDomain\":null,\"semanticType\":\"__NONE__\"}]},\"numInstances\":0},\"startTime\":0,\"endTime\":0,\"stepInterval\":0.1,\"minValue\":0,\"maxValue\":1},{\"type\":\"RANDOM\",\"id\":\"5418021bc0261c5a96f3f8e2\",\"name\":\"unnamed\",\"description\":null,\"properties\":{},\"created\":null,\"creator\":null,\"property\":null,\"device\":null,\"startTime\":0,\"endTime\":0,\"stepInterval\":0.1,\"minValue\":0,\"maxValue\":1}],\"constraints\":[{\"type\":\"BUILDER\",\"id\":\"0\",\"name\":null,\"description\":null,\"properties\":{},\"created\":null,\"creator\":null,\"expression\":\"foo\",\"lhs\":{\"type\":\"RANDOM\",\"id\":\"54178304c0265048194bdd39\",\"name\":\"t1\",\"description\":null,\"properties\":{},\"created\":null,\"creator\":null,\"property\":null,\"device\":{\"type\":\"GROUP\",\"id\":\"541782fac0265048194bdd38\",\"name\":\"unnamed\",\"description\":null,\"properties\":{},\"created\":null,\"creator\":null,\"deviceType\":{\"id\":\"5414b9aac026926e3bdec66d\",\"name\":\"unnamed 1\",\"description\":null,\"properties\":{},\"created\":null,\"creator\":null,\"children\":[],\"manufacturer\":null,\"type\":null,\"deviceProperties\":[{\"baseType\":\"LIST\",\"id\":\"5414fbcbc0266d9693092e74\",\"name\":\"location\",\"description\":null,\"properties\":{},\"created\":null,\"creator\":null,\"children\":[{\"baseType\":\"DOUBLE\",\"id\":\"5415097ec0266d9693092e81\",\"name\":\"lon\",\"description\":null,\"properties\":{},\"created\":null,\"creator\":null,\"children\":[],\"metadata\":{\"sensable\":null,\"actuatable\":null},\"constraints\":null,\"valueDomain\":null,\"semanticType\":\"LOCATION_LON\"},{\"baseType\":\"DOUBLE\",\"id\":\"54150e6ac0266d9693092e83\",\"name\":\"lat\",\"description\":null,\"properties\":{},\"created\":null,\"creator\":null,\"children\":[],\"metadata\":{\"sensable\":null,\"actuatable\":null},\"constraints\":null,\"valueDomain\":null,\"semanticType\":\"LOCATION_LAT\"}],\"metadata\":{\"sensable\":null,\"actuatable\":null},\"constraints\":null,\"valueDomain\":null,\"semanticType\":\"LOCATION\"},{\"baseType\":\"STRING\",\"id\":\"5414ff61c0266d9693092e76\",\"name\":\"t1\",\"description\":null,\"properties\":{},\"created\":null,\"creator\":null,\"children\":[],\"metadata\":{\"sensable\":null,\"actuatable\":null},\"constraints\":null,\"valueDomain\":null,\"semanticType\":\"__NONE__\"}]},\"numInstances\":0},\"startTime\":0,\"endTime\":0,\"stepInterval\":0.1,\"minValue\":0,\"maxValue\":1}}]}";
		value = "{\"id\":\"541782f8c0265048194bdd37\",\"name\":\"Unnamed Scenario\",\"description\":null,\"properties\":{},\"created\":null,\"creator\":null,\"devices\":[{\"type\":\"GROUP\",\"id\":\"541782fac0265048194bdd38\",\"name\":\"dev1\",\"description\":null,\"properties\":{},\"created\":null,\"creator\":null,\"deviceType\":{\"id\":\"5414b9aac026926e3bdec66d\",\"name\":\"unnamed 1\",\"description\":null,\"properties\":{},\"created\":null,\"creator\":null,\"children\":[],\"manufacturer\":null,\"type\":null,\"deviceProperties\":[{\"baseType\":\"LIST\",\"id\":\"5414fbcbc0266d9693092e74\",\"name\":\"location\",\"description\":null,\"properties\":{},\"created\":null,\"creator\":null,\"children\":[{\"baseType\":\"DOUBLE\",\"id\":\"5415097ec0266d9693092e81\",\"name\":\"lon\",\"description\":null,\"properties\":{},\"created\":null,\"creator\":null,\"children\":[],\"metadata\":{\"sensable\":null,\"actuatable\":null},\"constraints\":null,\"valueDomain\":null},{\"baseType\":\"DOUBLE\",\"id\":\"54150e6ac0266d9693092e83\",\"name\":\"lat\",\"description\":null,\"properties\":{},\"created\":null,\"creator\":null,\"children\":[],\"metadata\":{\"sensable\":null,\"actuatable\":null},\"constraints\":null,\"valueDomain\":null}],\"metadata\":{\"sensable\":null,\"actuatable\":null},\"constraints\":null,\"valueDomain\":null},{\"baseType\":\"STRING\",\"id\":\"5414ff61c0266d9693092e76\",\"name\":\"t1\",\"description\":null,\"properties\":{},\"created\":null,\"creator\":null,\"children\":[],\"metadata\":{\"sensable\":null,\"actuatable\":null},\"constraints\":null,\"valueDomain\":null}]},\"numInstances\":0}],\"simulationProperties\":[{\"type\":\"RANDOM\",\"id\":\"54178304c0265048194bdd39\",\"name\":\"p1\",\"description\":null,\"properties\":{},\"created\":null,\"creator\":null,\"property\":null,\"device\":{\"type\":\"GROUP\",\"id\":\"541782fac0265048194bdd38\",\"name\":\"dev1\",\"description\":null,\"properties\":{},\"created\":null,\"creator\":null,\"deviceType\":{\"id\":\"5414b9aac026926e3bdec66d\",\"name\":\"unnamed 1\",\"description\":null,\"properties\":{},\"created\":null,\"creator\":null,\"children\":[],\"manufacturer\":null,\"type\":null,\"deviceProperties\":[{\"baseType\":\"LIST\",\"id\":\"5414fbcbc0266d9693092e74\",\"name\":\"location\",\"description\":null,\"properties\":{},\"created\":null,\"creator\":null,\"children\":[{\"baseType\":\"DOUBLE\",\"id\":\"5415097ec0266d9693092e81\",\"name\":\"lon\",\"description\":null,\"properties\":{},\"created\":null,\"creator\":null,\"children\":[],\"metadata\":{\"sensable\":null,\"actuatable\":null},\"constraints\":null,\"valueDomain\":null},{\"baseType\":\"DOUBLE\",\"id\":\"54150e6ac0266d9693092e83\",\"name\":\"lat\",\"description\":null,\"properties\":{},\"created\":null,\"creator\":null,\"children\":[],\"metadata\":{\"sensable\":null,\"actuatable\":null},\"constraints\":null,\"valueDomain\":null}],\"metadata\":{\"sensable\":null,\"actuatable\":null},\"constraints\":null,\"valueDomain\":null},{\"baseType\":\"STRING\",\"id\":\"5414ff61c0266d9693092e76\",\"name\":\"t1\",\"description\":null,\"properties\":{},\"created\":null,\"creator\":null,\"children\":[],\"metadata\":{\"sensable\":null,\"actuatable\":null},\"constraints\":null,\"valueDomain\":null}]},\"numInstances\":0},\"startTime\":0,\"endTime\":0,\"stepInterval\":0.1,\"minValue\":0,\"maxValue\":1}],\"constraints\":[{\"type\":\"EXPRESSION\",\"id\":\"0\",\"name\":null,\"description\":null,\"properties\":{},\"created\":null,\"creator\":null,\"expression\":\"foo\"},{\"type\":\"BUILDER\",\"id\":1,\"name\":null,\"description\":null,\"properties\":{},\"created\":null,\"creator\":null}]}";
		Simulation s1 = mapper.readValue(value, Simulation.class);
		System.out.println(s1);
	}

}

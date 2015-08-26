/*
 * Copyright 2014 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.springframework.xd.modules.sink.elasticsearch;

import java.util.Date;
import java.util.List;
import java.util.Map;

import io.riox.xd.modules.processor.timeseries.WekaTimeSeries;
import io.riox.xd.modules.processor.timeseries.WekaTimeSeries.ClassifierType;
import net.minidev.json.parser.JSONParser;
import net.minidev.json.parser.ParseException;
import static org.junit.Assert.*;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.messaging.MessageChannel;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

/**
 * @author: Waldemar Hummer
 */
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations={"classpath:config/timeseries.xml","classpath:processor/timeseries/test-client.xml"})
@ActiveProfiles("node")
public class TestPrediction {

    @Autowired
    @Qualifier("input")
    MessageChannel outputChannel;
	JSONParser parser = new JSONParser(JSONParser.DEFAULT_PERMISSIVE_MODE);

	static double PRECISION = 0.0001;

    @Test
    public void testForecast() throws Exception {
    	WekaTimeSeries timeseries = new WekaTimeSeries();
    	timeseries.setForecastFields("value");
    	testForecast(timeseries);
    }

    @Test
    public void testForecastWithoutField() throws Exception {
    	WekaTimeSeries timeseries = new WekaTimeSeries();
    	testForecast(timeseries);
    }

    @Test
    public void testForecastTypes() throws Exception {
    	WekaTimeSeries timeseries1 = new WekaTimeSeries();
    	timeseries1.setType(ClassifierType.GAUSSIAN_PROCESSES);
    	testForecast(timeseries1);

    	WekaTimeSeries timeseries2 = new WekaTimeSeries();
    	timeseries2.setType(ClassifierType.LINEAR_REGRESSION);
    	testForecast(timeseries2);
    }

    private void testForecast(WekaTimeSeries timeseries) throws Exception {
    	timeseries.addInstance(json("{\"time\":\"" + new Date().toString() + "\", \"value\":1, \"value1\":1}"));
    	timeseries.addInstance(json("{\"time\":\"" + new Date().toString() + "\", \"value\":2, \"value1\":1}"));
    	timeseries.addInstance(json("{\"time\":\"" + new Date().toString() + "\", \"value\":3, \"value1\":1}"));
    	timeseries.addInstance(json("{\"time\":\"" + new Date().toString() + "\", \"value\":4, \"value2\":1}"));
    	int interval = 3;
    	List<Map<String,Object>> result = timeseries.forecast(interval);
    	double v1 = (Double) result.get(0).get("value");
    	double v2 = (Double) result.get(1).get("value");
    	double v3 = (Double) result.get(2).get("value");
    	if(timeseries.getType() == ClassifierType.LINEAR_REGRESSION) {
        	assertEquals(5, v1, PRECISION);
        	assertEquals(6, v2, PRECISION);
        	assertEquals(7, v3, PRECISION);
    	} else {
//        	System.out.println("forecast1: " + result);
    	}
    	assertEquals(result.size(), interval);

    	timeseries.addInstance(json("{\"time\":\"" + new Date().toString() + "\", \"value\":3}"));
    	timeseries.addInstance(json("{\"time\":\"" + new Date().toString() + "\", \"value\":4}"));
    	interval = 5;
    	result = timeseries.forecast(interval);
//    	System.out.println("forecast2: " + result);
    	assertEquals(result.size(), interval);
    	timeseries.addInstance(json("{\"time\":\"" + new Date().toString() + "\", \"value\":3}"));
    	timeseries.addInstance(json("{\"time\":\"" + new Date().toString() + "\", \"value\":4}"));
    	interval = 4;
    	result = timeseries.forecast(interval);
//    	System.out.println("forecast3: " + result);
    	assertEquals(result.size(), interval);
    }

    @SuppressWarnings("unchecked")
	private Map<String,Object> json(String json) {
    	try {
			return (Map<String, Object>) parser.parse(json);
		} catch (ParseException e) {
			throw new RuntimeException(e);
		}
    }
}

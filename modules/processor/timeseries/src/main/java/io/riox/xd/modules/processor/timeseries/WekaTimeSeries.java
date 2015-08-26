package io.riox.xd.modules.processor.timeseries;

import java.io.PrintStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import weka.classifiers.evaluation.NumericPrediction;
import weka.classifiers.functions.GaussianProcesses;
import weka.classifiers.functions.LinearRegression;
import weka.classifiers.timeseries.WekaForecaster;
import weka.core.Attribute;
import weka.core.Instance;
import weka.core.Instances;
import weka.core.SparseInstance;

/**
 * @author whummer
 */
public class WekaTimeSeries {

	private static final String CLASS_ATTR_NAME = "__classAttr";
	private static final Attribute CLASS_ATTRIBUTE = (new Attribute(CLASS_ATTR_NAME, (ArrayList<String>)null));
	private static final Object VALUE_NOT_A_NUMBER = null; /* value to use for NaN numbers (for message JSON output) */

	Instances instances;
	String[] forecastFields;
	List<String> columnNames = new LinkedList<String>();
	Map<String,Class<?>> columnTypes = new HashMap<String, Class<?>>();
	String timeField;
	WekaForecaster forecaster;
	ClassifierType type = ClassifierType.GAUSSIAN_PROCESSES;
	private Double min;

	public static enum ClassifierType {
		LINEAR_REGRESSION,
		GAUSSIAN_PROCESSES
	}

	public List<Map<String,Object>> forecast(int numSteps) {
		try {
			List<Map<String,Object>> result = new LinkedList<Map<String,Object>>();
			if(forecaster == null) {
				System.err.println("No forecast data available yet.");
				return result;
			}
			List<List<NumericPrediction>> forecast = forecaster.forecast(numSteps);

			List<String> fieldsToForecast = getFieldsToForecast();

			for (int i = 0; i < numSteps; i++) {
				List<NumericPrediction> predsAtStep = forecast.get(i);
				Map<String,Object> map = new HashMap<String,Object>();
				for (int j = 0; j < fieldsToForecast.size(); j++) {
					NumericPrediction predForTarget = predsAtStep.get(j);
					double predicted = predForTarget.predicted();
					predicted = getInRange(predicted); /* apply min/max ranges */
					if(Double.isNaN(predicted)) {
						if(VALUE_NOT_A_NUMBER != null) {
							map.put(fieldsToForecast.get(j), VALUE_NOT_A_NUMBER);
						}
					} else {
						map.put(fieldsToForecast.get(j), predicted);
					}
				}
				result.add(map);
			}
			return result;
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	public void addInstance(Map<String,Object> map) {
		for(String key : map.keySet()) {
			Object value = map.get(key);
			if(!columnNames.contains(key)) {
				columnNames.add(key);
			}
			if(!columnTypes.containsKey(key)) {
				columnTypes.put(key, value.getClass());
			} else if(columnTypes.get(key) != value.getClass()) {
				System.err.println("WARN: different types: " + columnTypes.get(key) + " - " + value.getClass());
			}
		}
		updateAndGetInstances();
		Instance inst = new SparseInstance(columnNames.size());
		inst.setDataset(instances);
		for(int i = 0; i < columnNames.size(); i ++) {
			String col = columnNames.get(i);
			Object val = map.get(col);
			if(val instanceof String)
				inst.setValue(i, (String)val);
			else if(val instanceof Double)
				inst.setValue(i, (double)(Double)val);
			else if(val instanceof Integer)
				inst.setValue(i, (double)(Integer)val);
		}
		/* add instance */
		addInstance(inst);
	}
	public void addInstance(Instance i) {
		// TODO: make sliding window to remove old instances after a while
		instances.add(i);
		/* update instances. */
		updateAndGetInstances();
		/* set class attribute. 
		 * TODO dummy value (not sure why we need class attribute) */
		i.setValue(CLASS_ATTRIBUTE, "class1");
		retrainModel();
	}

	public void trainModel(Instances instances) {
		try {
			List<String> fieldsToForecast = getFieldsToForecast();
			if(instances.numInstances() < 2 || fieldsToForecast.isEmpty()) {
				return;
			}

			// new forecaster
			forecaster = new WekaForecaster();

			String fields = "";
			for(String f : fieldsToForecast) {
				fields += f + ",";
			}
			fields = fields.substring(0, fields.length() - 1);
			forecaster.setFieldsToForecast(fields);

			/* set base forecaster */
			if(type == ClassifierType.LINEAR_REGRESSION) {
				forecaster.setBaseForecaster(new LinearRegression());
			} else if(type == ClassifierType.GAUSSIAN_PROCESSES) {
				forecaster.setBaseForecaster(new GaussianProcesses());
			}

			forecaster.getTSLagMaker().setTimeStampField(timeField);
			// forecaster.getTSLagMaker().setMinLag(1);
			// forecaster.getTSLagMaker().setMaxLag(12);

			// add indicator fields
			forecaster.getTSLagMaker().setAddMonthOfYear(true);
			forecaster.getTSLagMaker().setAddQuarterOfYear(true);
			forecaster.getTSLagMaker().setAddDayOfMonth(true);
			forecaster.getTSLagMaker().setAddDayOfWeek(true);
			forecaster.getTSLagMaker().setAddWeekendIndicator(true);

			// build the model
			forecaster.buildForecaster(instances);
			forecaster.primeForecaster(instances);

		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	/* GETTERS / SETTERS */

	public void setMinimumValue(Double min) {
		this.min = min;
	}

	public void setForecastFields(String ... forecastFields) {
		this.forecastFields = forecastFields;
	}

	public void setType(ClassifierType type) {
		this.type = type;
	}

	public ClassifierType getType() {
		return type;
	}

	/* HELPER METHODS */

	private void retrainModel() {
		trainModel(instances);
	}

	private boolean instancesNeedUpdate() {
		int neededAttrs = columnNames.size() + 1; // column names plus extra class attribute
		return instances == null || instances.numAttributes() != neededAttrs;
	}

	private double getInRange(double val) {
		if(min != null && (Double.isNaN(val) || val < min))
			val = min;
		return val;
	}

	private Instances updateAndGetInstances() {
		if(instancesNeedUpdate()) {
			ArrayList<Attribute> attrInfo = new ArrayList<Attribute>();
			for(String col : columnNames) {
				if(columnTypes.get(col) == String.class) {
					attrInfo.add(new Attribute(col, (ArrayList<String>)null));
				} else {
					attrInfo.add(new Attribute(col));
				}
			}
			attrInfo.add(CLASS_ATTRIBUTE);
			Instances newInstances = new Instances("instances", attrInfo, 10000);
			/* copy instances */
			if(instances != null) {
				for(int i = 0; i < instances.numInstances(); i ++) {
					Instance inst = instances.instance(i);
					newInstances.add(inst);
				}
			}
			instances = newInstances;
		}
		return instances;
	}

	void printInstance(Instance inst, PrintStream str) {
		for(int i = 0; i < inst.numAttributes(); i ++) {
			str.print(inst.attribute(i).name() + "=" + inst.value(i) + " ");
		}
		str.println();
	}

	private boolean isNumeric(String fieldName) {
		Class<?> clazz = columnTypes.get(fieldName);
		return clazz == Double.class || 
				clazz == Integer.class || 
						clazz == Long.class;
	}

	private List<String> getFieldsToForecast() {
		if(forecastFields != null && forecastFields.length > 0) {
			return Arrays.asList(forecastFields);
		}
		List<String> result = new LinkedList<String>();
		for(String col : columnNames) {
			if(isNumeric(col)) {
				result.add(col);
			}
		}
		return result;
	}

}

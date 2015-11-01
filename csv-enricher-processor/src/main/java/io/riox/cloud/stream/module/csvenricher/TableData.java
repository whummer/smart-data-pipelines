package io.riox.cloud.stream.module.csvenricher;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URL;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Scanner;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Abstraction for representing a tabular structure, e.g., CSV file, or a SQL result set.
 *
 * @author hummer
 */
public class TableData {

	private static final Logger LOG = LoggerFactory.getLogger(TableData.class);
	private static final String CHARSET = "UTF-8";

	private Map<String,Integer> headerMap = new LinkedHashMap<String,Integer>();
	private List<Record> records = new LinkedList<Record>();

	public static class Record {
		public List<String> values = new LinkedList<String>();
		Map<String, Integer> mapping = new HashMap<String,Integer>();
		long recordNumber;

		public Map<String,Object> asMap() {
			Map<String,Object> map = new HashMap<String,Object>();
			if(mapping != null) {
				for(String key : mapping.keySet()) {
					int index = mapping.get(key);
					map.put(key, values.get(index));
				}
			} else {
				/* need to assume column numbers as titles */
				//LOG.warn("Column headers not configured - using numeric column indices as column header names.");
				for(int i = 0; i < values.size(); i ++) {
					map.put("" + i, values.get(i));
				}
			}
			return map;
		}
		@Override
		public String toString() {
			return asMap().toString();
		}
	}

	public List<Map<String,Object>> asObjectList() {
		List<Map<String,Object>> result = new LinkedList<Map<String,Object>>();
		for(Record r : records) {
			result.add(r.asMap());
		}
		return result;
	}

	public List<String> getHeaderNames() {
		List<String> result = new LinkedList<String>();
		for(String s : headerMap.keySet())
			result.add(s);
		return result;
	}

	public Record find(String colName, String colValue) {
		if(colName == null) {
			throw new RuntimeException("Invalid column name for lookup.");
		}
		if(colValue == null) {
			LOG.warn("Invalid value '" + colValue + "' for column '" + colName + "'.");
		}
		// TODO improve performance of lookup
		for(Record r : records) {
			if(colValue != null && colValue.equals(r.asMap().get(colName))) {
				return r;
			}
		}
		return null;
	}

	public static TableData readCSV(String url, boolean hasHeader) {
		return readCSV(url, hasHeader, null);
	}
	public static TableData readCSV(String url, boolean hasHeader, String[] customHeaders) {
		try {
			CSVFormat format = CSVFormat.DEFAULT;
			if(hasHeader) {
				if(customHeaders == null) {
					/* empty array means headers are read from the first line in the CSV */
					customHeaders = new String[0];
				}
				format = format.withHeader(customHeaders);
			}
			CSVParser parser = new CSVParser(new InputStreamReader(new URL(url).openStream(), CHARSET), format);
			TableData t = new TableData();
			t.headerMap = parser.getHeaderMap();
			for(CSVRecord r : parser.getRecords()) {
				Record rec = new Record();
				for(String entry : r) {
					rec.values.add(entry);
					rec.recordNumber = r.getRecordNumber();
					rec.mapping = parser.getHeaderMap();
				}
				t.records.add(rec);
			}
			parser.close();
			return t;
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	static String readStream(InputStream is) {
		Scanner s = new Scanner(is);
		s.useDelimiter("\\A");
		String str = s.hasNext() ? s.next() : "";
	    s.close();
	    return str;
	}

	private static String readUrl(String url) {
		try {
			return readStream(new URL(url).openStream());
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	public static List<String> readUrlLines(String url) {
		String str = readUrl(url);
		List<String> result = new LinkedList<String>();
		for(String line : str.split("\n")) {
			result.add(line);
		}
		return result;
	}

	public List<Record> getRecords() {
		return records;
	}
	public Map<String, Integer> getHeaderMap() {
		return headerMap;
	}

	@Override
	public String toString() {
		StringBuilder b = new StringBuilder();
		b.append(getHeaderNames());
		b.append("\n");
		for(Record r : records) {
			b.append(r.toString());
			b.append("\n");
		}
		return super.toString();
	}
}

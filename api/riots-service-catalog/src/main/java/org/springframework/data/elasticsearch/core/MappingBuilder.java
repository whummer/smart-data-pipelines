package org.springframework.data.elasticsearch.core;
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


import static org.apache.commons.lang.StringUtils.*;
import static org.elasticsearch.common.xcontent.XContentFactory.*;
import static org.springframework.util.StringUtils.*;

import java.beans.BeanInfo;
import java.beans.Introspector;
import java.beans.PropertyDescriptor;
import java.io.IOException;
import java.lang.reflect.AccessibleObject;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import org.elasticsearch.common.mvel2.util.ReflectionUtil;
import org.elasticsearch.common.xcontent.XContentBuilder;
import org.springframework.beans.BeanUtils;
import org.springframework.core.GenericCollectionTypeResolver;
import org.springframework.data.annotation.Transient;
import org.springframework.data.elasticsearch.annotations.*;
import org.springframework.data.elasticsearch.core.completion.Completion;
import org.springframework.data.elasticsearch.core.facet.FacetRequest;
import org.springframework.data.elasticsearch.core.geo.GeoPoint;
import org.springframework.data.mapping.model.SimpleTypeHolder;
import org.springframework.data.util.ClassTypeInformation;
import org.springframework.data.util.ReflectionUtils;
import org.springframework.data.util.TypeInformation;

import com.fasterxml.jackson.databind.annotation.JsonSerialize.Typing;

/**
 * @author Rizwan Idrees
 * @author Mohsin Husen
 * @author Artur Konczak
 * @author Kevin Leturc
 */

class MappingBuilder {

	public static final String FIELD_STORE = "store";
	public static final String FIELD_TYPE = "type";
	public static final String FIELD_INDEX = "index";
	public static final String FIELD_FORMAT = "format";
	public static final String FIELD_SEARCH_ANALYZER = "search_analyzer";
	public static final String FIELD_INDEX_ANALYZER = "index_analyzer";
	public static final String FIELD_PROPERTIES = "properties";
	public static final String FIELD_PARENT = "_parent";

	public static final String COMPLETION_PAYLOADS = "payloads";
	public static final String COMPLETION_PRESERVE_SEPARATORS = "preserve_separators";
	public static final String COMPLETION_PRESERVE_POSITION_INCREMENTS = "preserve_position_increments";
	public static final String COMPLETION_MAX_INPUT_LENGTH = "max_input_length";

	public static final String INDEX_VALUE_NOT_ANALYZED = "not_analyzed";
	public static final String TYPE_VALUE_STRING = "string";
	public static final String TYPE_VALUE_GEO_POINT = "geo_point";
	public static final String TYPE_VALUE_COMPLETION = "completion";

	private static SimpleTypeHolder SIMPLE_TYPE_HOLDER = new SimpleTypeHolder();

	static XContentBuilder buildMapping(Class clazz, String indexType, String idFieldName, String parentType) throws IOException {

		XContentBuilder mapping = jsonBuilder().startObject().startObject(indexType);
		// Parent
		if (hasText(parentType)) {
			mapping.startObject(FIELD_PARENT).field(FIELD_TYPE, parentType).endObject();
		}

		// Properties
		XContentBuilder xContentBuilder = mapping.startObject(FIELD_PROPERTIES);

		mapEntity(xContentBuilder, clazz, true, idFieldName, EMPTY, false, FieldType.Auto);

		return xContentBuilder.endObject().endObject().endObject();
	}

	private static void mapEntity(XContentBuilder xContentBuilder, Class clazz, boolean isRootObject, String idFieldName,
								  String nestedObjectFieldName, boolean nestedOrObjectField, FieldType fieldType) throws IOException {
		
		List<AccessibleObject> fieldsAndMethods = new ArrayList<AccessibleObject>();
		fieldsAndMethods.addAll(Arrays.asList(retrieveFields(clazz)));
		fieldsAndMethods.addAll(Arrays.asList(retrieveMethods(clazz)));
		
		if (!isRootObject && (isAnyPropertyAnnotatedAsField(fieldsAndMethods) || nestedOrObjectField)) {
			String type = FieldType.Object.toString().toLowerCase();
			if (nestedOrObjectField) {
				type = fieldType.toString().toLowerCase();
			}
			xContentBuilder.startObject(nestedObjectFieldName).field(FIELD_TYPE, type).startObject(FIELD_PROPERTIES);
		}

		for (java.lang.reflect.AccessibleObject field : fieldsAndMethods) {

			if (field.isAnnotationPresent(Transient.class) || isInIgnoreFields(field)) {
				continue;
			}

			boolean isGeoField = isGeoField(field);
			boolean isCompletionField = isCompletionField(field);

			Field singleField = field.getAnnotation(Field.class);
			if (!isGeoField && !isCompletionField && isEntity(field) && isAnnotated(field)) {
				if (singleField == null) {
					continue;
				}
				boolean nestedOrObject = isNestedOrObjectField(field);
				mapEntity(xContentBuilder, getFieldType(field), false, EMPTY, getFieldOrMethodName(field), nestedOrObject, singleField.type());
				if (nestedOrObject) {
					continue;
				}
			}

			MultiField multiField = field.getAnnotation(MultiField.class);

			String fieldName = getFieldOrMethodName(field);
			if (isGeoField) {
				// TODO this may be a potential problem
				applyGeoPointFieldMapping(xContentBuilder, fieldName);
			}

			if (isCompletionField) {
				CompletionField completionField = field.getAnnotation(CompletionField.class);
				applyCompletionFieldMapping(xContentBuilder, fieldName, completionField);
			}

			if (isRootObject && singleField != null && isIdField(field, idFieldName)) {
				applyDefaultIdFieldMapping(xContentBuilder, getFieldOrMethodName(field));
			} else if (multiField != null) {
				addMultiFieldMapping(xContentBuilder, getFieldOrMethodName(field), multiField);
			} else if (singleField != null) {
				addSingleFieldMapping(xContentBuilder, getFieldOrMethodName(field), singleField);
			}
		}

		if (!isRootObject && isAnyPropertyAnnotatedAsField(fieldsAndMethods) || nestedOrObjectField) {
			xContentBuilder.endObject().endObject();
		}
	}

	private static Method[] retrieveMethods(Class clazz) {		
		// Create list of methods.
		List<java.lang.reflect.Method> methods = new ArrayList<java.lang.reflect.Method>();
		
		// Keep backing up the inheritance hierarchy.
		Class targetClass = clazz;
		do {
			methods.addAll(Arrays.asList(targetClass.getDeclaredMethods()));
			targetClass = targetClass.getSuperclass();
		}
		while (targetClass != null && targetClass != Object.class);

		return methods.toArray(new java.lang.reflect.Method[methods.size()]);
		
	}

	private static java.lang.reflect.Field[] retrieveFields(Class clazz) {	
		// Create list of fields.
		List<java.lang.reflect.Field> fields = new ArrayList<java.lang.reflect.Field>();
		
		// Keep backing up the inheritance hierarchy.
		Class targetClass = clazz;
		do {
			fields.addAll(Arrays.asList(targetClass.getDeclaredFields()));
			targetClass = targetClass.getSuperclass();
		}
		while (targetClass != null && targetClass != Object.class);

		return fields.toArray(new java.lang.reflect.Field[fields.size()]);
	}

	private static boolean isAnnotated(java.lang.reflect.AccessibleObject field) {
		return field.getAnnotation(Field.class) != null || field.getAnnotation(MultiField.class) != null || field.getAnnotation(GeoPointField.class) != null || field.getAnnotation(CompletionField.class) != null;
	}

	private static void applyGeoPointFieldMapping(XContentBuilder xContentBuilder, String fieldName) throws IOException {
		xContentBuilder.startObject(fieldName);
		xContentBuilder.field(FIELD_TYPE, TYPE_VALUE_GEO_POINT)
				.endObject();
	}

	private static void applyCompletionFieldMapping(XContentBuilder xContentBuilder, String fieldName, CompletionField annotation) throws IOException {
		xContentBuilder.startObject(fieldName);
		xContentBuilder.field(FIELD_TYPE, TYPE_VALUE_COMPLETION);
		if (annotation != null) {
			xContentBuilder.field(COMPLETION_MAX_INPUT_LENGTH, annotation.maxInputLength());
			xContentBuilder.field(COMPLETION_PAYLOADS, annotation.payloads());
			xContentBuilder.field(COMPLETION_PRESERVE_POSITION_INCREMENTS, annotation.preservePositionIncrements());
			xContentBuilder.field(COMPLETION_PRESERVE_SEPARATORS, annotation.preserveSeparators());
			if (isNotBlank(annotation.searchAnalyzer())) {
				xContentBuilder.field(FIELD_SEARCH_ANALYZER, annotation.searchAnalyzer());
			}
			if (isNotBlank(annotation.indexAnalyzer())) {
				xContentBuilder.field(FIELD_INDEX_ANALYZER, annotation.indexAnalyzer());
			}
		}
		xContentBuilder.endObject();
	}

	private static void applyDefaultIdFieldMapping(XContentBuilder xContentBuilder, String fieldName)
			throws IOException {
		xContentBuilder.startObject(fieldName)
				.field(FIELD_TYPE, TYPE_VALUE_STRING)
				.field(FIELD_INDEX, INDEX_VALUE_NOT_ANALYZED);
		xContentBuilder.endObject();
	}

	/**
	 * Apply mapping for a single @Field annotation
	 *
	 * @throws IOException
	 */
	private static void addSingleFieldMapping(XContentBuilder xContentBuilder, String fieldName,
											  Field fieldAnnotation) throws IOException {
		xContentBuilder.startObject(fieldName);
		xContentBuilder.field(FIELD_STORE, fieldAnnotation.store());
		if (FieldType.Auto != fieldAnnotation.type()) {
			xContentBuilder.field(FIELD_TYPE, fieldAnnotation.type().name().toLowerCase());
			if (FieldType.Date == fieldAnnotation.type() && DateFormat.none != fieldAnnotation.format()) {
				xContentBuilder.field(FIELD_FORMAT, DateFormat.custom == fieldAnnotation.format()
						? fieldAnnotation.pattern() : fieldAnnotation.format());
			}
		}
		if (FieldIndex.not_analyzed == fieldAnnotation.index()) {
			xContentBuilder.field(FIELD_INDEX, fieldAnnotation.index().name().toLowerCase());
		}
		if (isNotBlank(fieldAnnotation.searchAnalyzer())) {
			xContentBuilder.field(FIELD_SEARCH_ANALYZER, fieldAnnotation.searchAnalyzer());
		}
		if (isNotBlank(fieldAnnotation.indexAnalyzer())) {
			xContentBuilder.field(FIELD_INDEX_ANALYZER, fieldAnnotation.indexAnalyzer());
		}
		xContentBuilder.endObject();
	}

	/**
	 * Apply mapping for a single nested @Field annotation
	 *
	 * @throws IOException
	 */
	private static void addNestedFieldMapping(XContentBuilder builder, String fieldName,
											  NestedField annotation) throws IOException {
		builder.startObject(fieldName + "." + annotation.dotSuffix());
		builder.field(FIELD_STORE, annotation.store());
		if (FieldType.Auto != annotation.type()) {
			builder.field(FIELD_TYPE, annotation.type().name().toLowerCase());
		}
		if (FieldIndex.not_analyzed == annotation.index()) {
			builder.field(FIELD_INDEX, annotation.index().name().toLowerCase());
		}
		if (isNotBlank(annotation.searchAnalyzer())) {
			builder.field(FIELD_SEARCH_ANALYZER, annotation.searchAnalyzer());
		}
		if (isNotBlank(annotation.indexAnalyzer())) {
			builder.field(FIELD_INDEX_ANALYZER, annotation.indexAnalyzer());
		}
		builder.endObject();
	}

	/**
	 * Multi field mappings for string type fields, support for sorts and facets
	 *
	 * @throws IOException
	 */
	private static void addMultiFieldMapping(XContentBuilder builder, String fieldName,
											 MultiField annotation) throws IOException {
		builder.startObject(fieldName);
		builder.field(FIELD_TYPE, "multi_field");
		builder.startObject("fields");
		//add standard field
		addSingleFieldMapping(builder, fieldName, annotation.mainField());
		for (NestedField nestedField : annotation.otherFields()) {
			addNestedFieldMapping(builder, fieldName, nestedField);
		}
		builder.endObject();
		builder.endObject();
	}

	/**
	 * Facet field for string type, for other types we don't need it(long, int, double, float)
	 *
	 * @throws IOException
	 */
	private static void addFacetMapping(XContentBuilder builder, java.lang.reflect.Field field, Field annotation) throws IOException {
		builder.startObject(FacetRequest.FIELD_UNTOUCHED)
				.field(FIELD_TYPE, TYPE_VALUE_STRING)
				.field(FIELD_INDEX, INDEX_VALUE_NOT_ANALYZED)
				.field(FIELD_STORE, true);
		builder.endObject();
	}

	/**
	 * Sort field for string type, for other types we don't need it(long, int, double, float)
	 * value of the field should be converted to lowercase and not analise
	 *
	 * @throws IOException
	 */
	private static void addSortMapping(XContentBuilder builder, java.lang.reflect.Field field, Field annotation) throws IOException {
		builder.startObject(FacetRequest.FIELD_SORT)
				.field(FIELD_TYPE, TYPE_VALUE_STRING)
				.field(FIELD_INDEX, "keyword")
				.field(FIELD_STORE, true);
		builder.endObject();
	}

	protected static boolean isEntity(java.lang.reflect.AccessibleObject field) {
		TypeInformation typeInformation = ClassTypeInformation.from(getFieldOrMethodType(field));
		Class<?> clazz = getFieldType(field);
		boolean isComplexType = !SIMPLE_TYPE_HOLDER.isSimpleType(clazz);
		return isComplexType && !Map.class.isAssignableFrom(typeInformation.getType());
	}

	protected static Class<?> getFieldType(java.lang.reflect.AccessibleObject field) {
		Class<?> clazz = getFieldOrMethodType(field);
		// FIXME get field type associated with a method
		TypeInformation typeInformation = ClassTypeInformation.from(clazz);
		if (typeInformation.isCollectionLike()) {
			
			if (field instanceof java.lang.reflect.Field) {
				 java.lang.reflect.Field f = (java.lang.reflect.Field)field;						
				 clazz = GenericCollectionTypeResolver.getCollectionFieldType(f) != null ? 
						 GenericCollectionTypeResolver.getCollectionFieldType(f) : typeInformation.getComponentType().getType();
			} else if (field instanceof java.lang.reflect.Method) {
				 java.lang.reflect.Method m = (java.lang.reflect.Method)field;						
				 clazz = GenericCollectionTypeResolver.getCollectionReturnType(m) != null ? 
						 GenericCollectionTypeResolver.getCollectionReturnType(m) : typeInformation.getComponentType().getType();
			}
		}
		return clazz;
	}

	private static boolean isAnyPropertyAnnotatedAsField(List<java.lang.reflect.AccessibleObject> fields) {
		if (fields != null) {
			for (java.lang.reflect.AccessibleObject field : fields) {
				if (field.isAnnotationPresent(Field.class)) {
					return true;
				}
			}
		}
		return false;
	}

	private static boolean isIdField(java.lang.reflect.AccessibleObject field, String idFieldName) {
		return idFieldName.equals( getFieldOrMethodName(field) );
	}

	private static boolean isInIgnoreFields(java.lang.reflect.AccessibleObject field) {
		Field fieldAnnotation = field.getAnnotation(Field.class);
		if (null != fieldAnnotation) {
			String[] ignoreFields = fieldAnnotation.ignoreFields();
			String name = getFieldOrMethodName(field);
			return Arrays.asList(ignoreFields).contains(name);
		}
		return false;
	}

	private static boolean isNestedOrObjectField(java.lang.reflect.AccessibleObject field) {
		Field fieldAnnotation = field.getAnnotation(Field.class);
		return fieldAnnotation != null && (FieldType.Nested == fieldAnnotation.type() || FieldType.Object == fieldAnnotation.type());
	}

	private static boolean isGeoField(java.lang.reflect.AccessibleObject field) {		
		return getFieldOrMethodType(field) == GeoPoint.class || field.getAnnotation(GeoPointField.class) != null;
	}

	private static boolean isCompletionField(java.lang.reflect.AccessibleObject field) {
		return getFieldOrMethodType(field) == Completion.class && field instanceof java.lang.reflect.Field;
	}
	
	private static Class<?> getFieldOrMethodType(AccessibleObject obj) {
		Class<?> clazz = null;
		if (obj instanceof java.lang.reflect.Field) {
			clazz = ((java.lang.reflect.Field)obj).getType();
		} else if (obj instanceof Method){
			clazz = ((Method)obj).getReturnType();
		}		
		return clazz;
	}
	
	private static String getFieldOrMethodName(AccessibleObject obj) {
		String name = null;
		if (obj instanceof java.lang.reflect.Field) {
			name = ((java.lang.reflect.Field)obj).getName();
		} else if (obj instanceof Method){
			PropertyDescriptor pd = BeanUtils.findPropertyForMethod((Method)obj);
			if (pd != null) {
				name = pd.getName();
			}
		}		
		return name;
	}
}

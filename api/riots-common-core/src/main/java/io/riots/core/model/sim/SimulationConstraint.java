package io.riots.core.model.sim;

import io.riots.core.model.BaseObjectCreated;
import io.riots.services.model.Constants;

import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonSubTypes.Type;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

/**
 * Represents a device specification for a simulation. 
 * A device spec is one of the following:
 *  - Device Group: List of devices of a special type
 *  - Device Instance: Reference to a concrete device instance
 * 
 * @author Waldemar Hummer
 */
@Document(collection = Constants.COLL_SIMULATIONS)
@JsonSubTypes({
	@Type(value = SimulationConstraint.SimulationConstraintExpression.class, name=SimulationConstraint.TYPE_EXPRESSION),
	@Type(value = SimulationConstraint.SimulationConstraintBuilder.class, name=SimulationConstraint.TYPE_BUILDER)
})
@JsonTypeInfo(
		use = JsonTypeInfo.Id.NAME,
		include = JsonTypeInfo.As.PROPERTY,
		property = "type"
)
public abstract class SimulationConstraint extends BaseObjectCreated<SimulationConstraint> {

	public static final String TYPE_EXPRESSION = "EXPRESSION";
	public static final String TYPE_BUILDER = "BUILDER";

	protected String type;

	public static class SimulationConstraintExpression extends SimulationConstraint {
		{
			type = TYPE_EXPRESSION;
		}
		private String expression;

		public String getExpression() {
			return expression;
		}
		public void setExpression(String expression) {
			this.expression = expression;
		}
		@Override
		public String toString() {
			return "SimulationConstraintExpression [expression=" + expression
					+ "]";
		}
	}

	public static enum Operator {
		LT, LE, EQ, GE, GT
	}
	public static class SimulationConstraintBuilder extends SimulationConstraint {
		{
			type = TYPE_BUILDER;
		}

		@DBRef
		private PropertySimulation<?> lhs;
		private String lhsConstant;
		private Operator operator;
		@DBRef
		private PropertySimulation<?> rhs;
		private String rhsConstant;

		public PropertySimulation<?> getLhs() {
			return lhs;
		}
		public String getLhsConstant() {
			return lhsConstant;
		}
		public Operator getOperator() {
			return operator;
		}
		public PropertySimulation<?> getRhs() {
			return rhs;
		}
		public String getRhsConstant() {
			return rhsConstant;
		}

		@Override
		public String toString() {
			return "SimulationConstraintBuilder [lhs=" + lhs + ", lhsConstant="
					+ lhsConstant + ", operator=" + operator + ", rhs=" + rhs
					+ ", rhsConstant=" + rhsConstant + "]";
		}
		
	}

}

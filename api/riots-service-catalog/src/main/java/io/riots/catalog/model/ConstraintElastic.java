package io.riots.catalog.model;

/**
 * Represents a constraint (typically on a {@link PropertyElastic}) which 
 * expresses a condition that has to evaluate to true.
 * 
 * @author Waldemar Hummer
 */
public class ConstraintElastic {

	private String expression;

	public String getExpression() {
		return expression;
	}
	public void setExpression(String expression) {
		this.expression = expression;
	}

}

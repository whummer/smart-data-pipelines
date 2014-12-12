package io.riots.core.model;

/**
 * Represents a constraint (typically on a {@link Property}) which 
 * expresses a condition that has to evaluate to true.
 * 
 * @author Waldemar Hummer
 */
public class Constraint {

	String expression;

	public String getExpression() {
		return expression;
	}
	public void setExpression(String expression) {
		this.expression = expression;
	}

}

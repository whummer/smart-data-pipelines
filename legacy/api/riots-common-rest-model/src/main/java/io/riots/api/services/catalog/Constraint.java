package io.riots.api.services.catalog;

/**
 * Represents a constraint (typically on a {@link Property}) which 
 * expresses a condition that has to evaluate to true.
 * 
 * @author Waldemar Hummer
 */
public class Constraint {

	private String expression;

	public String getExpression() {
		return expression;
	}
	public void setExpression(String expression) {
		this.expression = expression;
	}

}

package com.viotualize.core.scripting;

import groovy.util.Expando;

import java.util.LinkedList;
import java.util.List;

import org.jacop.constraints.Constraint;
import org.jacop.core.IntVar;
import org.jacop.core.Store;
import org.jacop.core.Var;
import org.jacop.floats.core.FloatVar;

public class VariableWrapper extends Expando implements Comparable<Object> {

	List<Var> vars = new LinkedList<Var>();
	Store store;

	public VariableWrapper() {}
	public VariableWrapper(List<Var> vars, Store store) {
		this.vars = vars;
		this.store = store;
	}
	@Deprecated
	public VariableWrapper(Var var, Store store) {
		this.vars.add(var);
		this.store = store;
	}

	public Object invokeMethod(String name, Object args) {
		System.out.println("invoke " + name + " - " + args);
		return super.invokeMethod(name, args);
	}

	public int compareTo(Object obj) {
		System.out.println("compare to " + obj);
		//Thread.dumpStack();
		return 0;
	}

	public Object propertyMissing(String name) {
		System.out.println("Property property '" + name);	
		return null;
	}

	public void methodMissing(String name, Object args) {
		System.out.println("Method missing " + name);
		Thread.dumpStack();
	}

	public VariableWrapper doOperation(VariableWrapper other, String op, boolean inverse) {
		List<Var> newVars = new LinkedList<Var>();
		for(int i = 0; i < other.vars.size(); i ++) {
			Var newVar = null;
			Var var = vars.get(i);
			Var otherVar = other.vars.get(i);
			if(var instanceof IntVar) {
				newVar = new IntVar(store, ((IntVar) var).domain);
				if(inverse)
					store.impose(newConstraint("X" + op + "YeqZ", (IntVar)newVar, (IntVar)otherVar, (IntVar)var));
				else
					store.impose(newConstraint("X" + op + "YeqZ", (IntVar)var, (IntVar)otherVar, (IntVar)newVar));
 			}
			if(var instanceof FloatVar) {
				newVar = new FloatVar(store, ((FloatVar) var).domain);
				if(inverse)
					store.impose(newConstraint("P" + op + "QeqR", (FloatVar)newVar, (FloatVar)otherVar, (FloatVar)var));
				else
					store.impose(newConstraint("P" + op + "QeqR", (FloatVar)var, (FloatVar)otherVar, (FloatVar)newVar));
			}
			System.out.println(this + " + " + other);
			newVars.add(newVar);
		}
		return new VariableWrapper(newVars, store);
	}
	public VariableWrapper plus(VariableWrapper other) {
		return doOperation(other, "plus", false);
	}
	public VariableWrapper minus(VariableWrapper other) {
		return doOperation(other, "plus", true);
//		Var newVar = null;
//		if(var instanceof IntVar) {
//			newVar = new IntVar(store, ((IntVar) var).domain);
//			store.impose(new XplusYeqZ((IntVar)newVar, (IntVar)other.var, (IntVar)var));
//		}
//		if(var instanceof FloatVar) {
//			newVar = new FloatVar(store, ((FloatVar) var).domain);
//			store.impose(new PplusQeqR((FloatVar)newVar, (FloatVar)other.var, (FloatVar)var));
//		}
//		return new VariableWrapper(newVar, store);
	}
	public VariableWrapper multiply(VariableWrapper other) {
		return doOperation(other, "mult", false);
//		Var newVar = null;
//		if(var instanceof IntVar) {
//			newVar = new IntVar(store, ((IntVar) var).domain);
//			store.impose(new XmulYeqZ((IntVar)var, (IntVar)other.var, (IntVar)newVar));
//		}
//		if(var instanceof FloatVar) {
//			newVar = new FloatVar(store, ((FloatVar) var).domain);
//			store.impose(new PmulQeqR((FloatVar)var, (FloatVar)other.var, (FloatVar)newVar));
//		}
//		return new VariableWrapper(newVar, store);
	}
	public VariableWrapper divide(VariableWrapper other) {
		return doOperation(other, "mult", true);
//		Var newVar = null;
//		if(var instanceof IntVar) {
//			newVar = new IntVar(store, ((IntVar) var).domain);
//			store.impose(new XmulYeqZ((IntVar)newVar, (IntVar)other.var, (IntVar)var));
//		}
//		if(var instanceof FloatVar) {
//			newVar = new FloatVar(store, ((FloatVar) var).domain);
//			store.impose(new PmulQeqR((FloatVar)newVar, (FloatVar)other.var, (FloatVar)var));
//		}
//		return new VariableWrapper(newVar, store);
	}

	private static void addComparisonConstraint(
			Object left, Object right, String op, String reverseOp) {
		System.out.println("Adding constraint: " + left + " '" + op + "' " + right);
		Store store = (left instanceof VariableWrapper) ? 
				((VariableWrapper)left).store : ((VariableWrapper)right).store;
		if (left instanceof VariableWrapper) {
			List<Var> leftVars = ((VariableWrapper)left).vars;
			for(int i = 0; i < leftVars.size(); i ++) {
				Var leftVar = leftVars.get(i);
				if(right instanceof VariableWrapper) {
					Var rightVar = ((VariableWrapper)right).vars.get(i);
					if(leftVar instanceof IntVar) {
						store.impose(newConstraint("X" + op + "Y", (IntVar)leftVar, (IntVar)rightVar));
					} else {
						store.impose(newConstraint("P" + op + "Q", (FloatVar)leftVar, (FloatVar)rightVar));
					}
				} else {
					if(leftVar instanceof IntVar) {
						System.out.println(store + " - " + leftVar + " " + op + " " + right + " - " + i + " - " + leftVars);
						store.impose(newConstraint("X" + op + "C", (IntVar)leftVar, (int)right));
					} else {
						store.impose(newConstraint("P" + op + "C", (FloatVar)leftVar, (double)right));
					}
				}
			}
		} else {
			List<Var> rightVars = ((VariableWrapper)right).vars;
			for(int i = 0; i < rightVars.size(); i ++) {
				Var rightVar = rightVars.get(i);
				if(rightVar instanceof IntVar) {
					store.impose(newConstraint("X" + reverseOp + "C", (IntVar)rightVar, (int)left));
				} else {
					store.impose(newConstraint("P" + reverseOp + "C", (FloatVar)rightVar, (double)left));
				}
			}
		}
	}
	private static Constraint newConstraint(String clazzName, Object ... args) {
		try {
			if(clazzName.startsWith("X")) {
				clazzName = "org.jacop.constraints." + clazzName;
			} else {
				clazzName = "org.jacop.floats.constraints." + clazzName;
			}
			@SuppressWarnings("unchecked")
			Class<? extends Constraint> clazz = (Class<? extends Constraint>)Class.forName(clazzName);
			Class<?>[] classes = new Class<?>[args.length];
			for(int i = 0; i < args.length; i ++) {
				classes[i] = args[i].getClass();
				if(classes[i] == Integer.class)
					classes[i] = int.class;
				if(classes[i] == Double.class)
					classes[i] = double.class;
			}
			return clazz.getConstructor(classes).newInstance(args);
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}
	/**
	 * Operator "<"
	 * @param left
	 * @param right
	 */
	public static void compareLessThan(Object left, Object right) {
		addComparisonConstraint(left, right, "lt", "gt");
	}
	/**
	 * Operator "<="
	 * @param left
	 * @param right
	 */
	public static void compareLessThanEqual(Object left, Object right) {
		addComparisonConstraint(left, right, "lteq", "gteq");
	}
	/**
	 * Operator ">"
	 * @param left
	 * @param right
	 */
	public static void compareGreaterThan(Object left, Object right) {
		addComparisonConstraint(left, right, "gt", "lt");
	}
	/**
	 * Operator ">="
	 * @param left
	 * @param right
	 */
	public static void compareGreaterThanEqual(Object left, Object right) {
		addComparisonConstraint(left, right, "gteq", "lteq");
	}
	/**
	 * Operator "=="
	 * @param left
	 * @param right
	 */
	public static void compareIdentical(Object left, Object right) {
		addComparisonConstraint(left, right, "eq", "eq");
	}
	/**
	 * Operator "!="
	 * @param left
	 * @param right
	 */
	public static void compareNotIdentical(Object left, Object right) {
		addComparisonConstraint(left, right, "neq", "neq");
	}
}


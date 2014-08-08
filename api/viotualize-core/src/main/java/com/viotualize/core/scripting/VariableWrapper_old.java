package com.viotualize.core.scripting;

import groovy.util.Expando;

import org.jacop.constraints.Constraint;
import org.jacop.constraints.XmulYeqZ;
import org.jacop.constraints.XplusYeqZ;
import org.jacop.core.IntVar;
import org.jacop.core.Store;
import org.jacop.core.Var;
import org.jacop.floats.constraints.PmulQeqR;
import org.jacop.floats.constraints.PplusQeqR;
import org.jacop.floats.core.FloatVar;

public class VariableWrapper_old extends Expando implements Comparable<Object> {

	Var var;
	Store store;

	public VariableWrapper_old() {}
	public VariableWrapper_old(Var var, Store store) {
		this.var = var;
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
		System.out.println("Missing property '" + name);	
		return null;
	}

	public void methodMissing(String name, Object args) {
		System.out.println("Method missing " + name);
	}

	public VariableWrapper_old plus(VariableWrapper_old other) {
		Var newVar = null;
		if(var instanceof IntVar) {
			newVar = new IntVar(store, ((IntVar) var).domain);
			store.impose(new XplusYeqZ((IntVar)var, (IntVar)other.var, (IntVar)newVar));
		}
		if(var instanceof FloatVar) {
			newVar = new FloatVar(store, ((FloatVar) var).domain);
			store.impose(new PplusQeqR((FloatVar)var, (FloatVar)other.var, (FloatVar)newVar));
		}
		System.out.println(this + " + " + other);
		return new VariableWrapper_old(newVar, store);
	}
	public VariableWrapper_old minus(VariableWrapper_old other) {
		Var newVar = null;
		if(var instanceof IntVar) {
			newVar = new IntVar(store, ((IntVar) var).domain);
			store.impose(new XplusYeqZ((IntVar)newVar, (IntVar)other.var, (IntVar)var));
		}
		if(var instanceof FloatVar) {
			newVar = new FloatVar(store, ((FloatVar) var).domain);
			store.impose(new PplusQeqR((FloatVar)newVar, (FloatVar)other.var, (FloatVar)var));
		}
		return new VariableWrapper_old(newVar, store);
	}
	public VariableWrapper_old multiply(VariableWrapper_old other) {
		Var newVar = null;
		if(var instanceof IntVar) {
			newVar = new IntVar(store, ((IntVar) var).domain);
			store.impose(new XmulYeqZ((IntVar)var, (IntVar)other.var, (IntVar)newVar));
		}
		if(var instanceof FloatVar) {
			newVar = new FloatVar(store, ((FloatVar) var).domain);
			store.impose(new PmulQeqR((FloatVar)var, (FloatVar)other.var, (FloatVar)newVar));
		}
		return new VariableWrapper_old(newVar, store);
	}
	public VariableWrapper_old divide(VariableWrapper_old other) {
		Var newVar = null;
		if(var instanceof IntVar) {
			newVar = new IntVar(store, ((IntVar) var).domain);
			store.impose(new XmulYeqZ((IntVar)newVar, (IntVar)other.var, (IntVar)var));
		}
		if(var instanceof FloatVar) {
			newVar = new FloatVar(store, ((FloatVar) var).domain);
			store.impose(new PmulQeqR((FloatVar)newVar, (FloatVar)other.var, (FloatVar)var));
		}
		return new VariableWrapper_old(newVar, store);
	}

	private static void addComparisonConstraint(
			Object left, Object right, String op, String reverseOp) {
		System.out.println("Adding constraint: " + left + " '" + op + "' " + right);
		Store store = (left instanceof VariableWrapper_old) ? 
				((VariableWrapper_old)left).store : ((VariableWrapper_old)right).store;
		if (left instanceof VariableWrapper_old) {
			Var leftVar = ((VariableWrapper_old)left).var;
			if(right instanceof VariableWrapper_old) {
				Var rightVar = ((VariableWrapper_old)right).var;
				if(leftVar instanceof IntVar) {
					store.impose(newConstraint("X" + op + "Y", (IntVar)leftVar, (IntVar)rightVar));
				} else {
					store.impose(newConstraint("P" + op + "Q", (FloatVar)leftVar, (FloatVar)rightVar));
				}
			} else {
				if(leftVar instanceof IntVar) {
					store.impose(newConstraint("X" + op + "C", (IntVar)leftVar, (int)right));
				} else {
					store.impose(newConstraint("P" + op + "C", (FloatVar)leftVar, (double)right));
				}
			}
		} else {
			Var rightVar = ((VariableWrapper_old)right).var;
			if(rightVar instanceof IntVar) {
				store.impose(newConstraint("X" + reverseOp + "C", (IntVar)rightVar, (int)left));
			} else {
				store.impose(newConstraint("P" + reverseOp + "C", (FloatVar)rightVar, (double)left));
			}
		}
	}
	private static Constraint newConstraint(String clazzName, Object arg1, Object arg2) {
		try {
			if(clazzName.startsWith("X")) {
				clazzName = "org.jacop.constraints." + clazzName;
			} else {
				clazzName = "org.jacop.floats.constraints." + clazzName;
			}
			@SuppressWarnings("unchecked")
			Class<? extends Constraint> clazz = (Class<? extends Constraint>)Class.forName(clazzName);
			Class<?> c2 = arg2.getClass();
			if(c2 == Integer.class)
				c2 = int.class;
			if(c2 == Double.class)
				c2 = double.class;
			return clazz.getConstructor(arg1.getClass(), c2).newInstance(arg1, arg2);
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


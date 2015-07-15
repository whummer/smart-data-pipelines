package io.riots.core.sim.jep;

import java.util.Stack;
import java.util.Vector;

import org.apache.commons.math3.stat.StatUtils;
import org.nfunk.jep.ParseException;
import org.nfunk.jep.function.PostfixMathCommandI;

public class CustomOperators implements PostfixMathCommandI {
	
	public static enum OperatorType {
		MIN, MAX
	}

	private OperatorType type;

	public CustomOperators(OperatorType type) {
		this.type = type;
	}
	
	@SuppressWarnings("all")
	public void run(Stack paramStack) throws ParseException {
		try {
			Vector<?> args = paramStack;
			if(args.isEmpty()) {
				return;
			}
			if(args.get(0) instanceof Vector<?>) {
				args = (Vector<?>) args.get(0);
			}
			double[] values = new double[args.size()];
			int i = 0;
			for(Object arg : args) {
				values[i ++] = (Double)arg;
			}
			Double result = null;
			if(type == OperatorType.MAX) {
				result = StatUtils.max(values);
			} else if(type == OperatorType.MIN) {
				result = StatUtils.min(values);
			}
			args.clear();
			paramStack.add(result);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public int getNumberOfParameters() {
		return -1;
	}
	public boolean checkNumberOfParameters(int paramInt) {
		return true;
	}
	public void setCurNumberOfParameters(int paramInt) {
	}
}

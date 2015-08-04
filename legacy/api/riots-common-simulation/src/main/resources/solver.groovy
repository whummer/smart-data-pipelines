import groovy.transform.Field
import org.jacop.core.*
import org.jacop.floats.core.*
import org.jacop.constraints.*
import org.jacop.search.*
import io.riots.core.domain.*;
import io.riots.core.scripting.*;

// define logic solver data structures

@Field store = new Store()
t = new Object()

times = (STARTTIME..ENDTIME)

/* prepare result variables */
resultStates = []
resultVars = []

DEVICES.each { dev ->

	devWrapper = new VariableWrapper();
	setProperty(dev.name, devWrapper);
	devTypeMapper = null
	if(hasProperty(dev.assetType.name)) {
		devTypeMapper = getProperty(dev.assetType.name)
	} else {
		devTypeWrapper = new VariableWrapper();
		setProperty(dev.assetType.name, devTypeWrapper);
	}
	devWrapper.type = devTypeWrapper

	dev.assetType.setProperties.each() { prop ->

		times.each() { i ->

			if(! resultStates[i]) {
				resultStates[i] = []
			}

			propVal = new io.riots.core.domain.PropertyValue()
			resultStates[i].add(propVal)
			propVal.property = prop
			if (prop.getBaseType() == Property.BaseTypeEnum.LONG) {
				propVal.value = 
						new IntVar(store, (int)prop.getValueDomain().getMin(), (int)prop.getValueDomain().getMax());
			}
			if (prop.getBaseType() == Property.BaseTypeEnum.INTEGER) {
				propVal.value = 
						new IntVar(store, prop.getValueDomain().getMin(), prop.getValueDomain().getMax());
			}
			if (prop.getBaseType() == Property.BaseTypeEnum.DOUBLE) {
				propVal.value = 
						new IntVar(store, (int)prop.getValueDomain().getMin(), (int)prop.getValueDomain().getMax());
			}
			if (prop.getBaseType() == Property.BaseTypeEnum.STRING) {
				propVal.value = 
						new IntVar(store, 0, prop.getValueDomain().getValues().length);
			}
			resultVars.add(propVal.value);

			if(!devTypeWrapper.hasProperty(prop.name)) {
				devTypeWrapper.setProperty(prop.name, new VariableWrapper(new LinkedList(), store))
			}
			devTypeWrapper.getProperty(prop.name).vars.add(propVal.value)
			//println "devTypeWrapper size " + devTypeWrapper.getProperty(prop.name).vars.size()

			if(!devWrapper.hasProperty(prop.name)) {
				devWrapper.setProperty(prop.name, new VariableWrapper(new LinkedList(), store))
			}
			devWrapper.getProperty(prop.name).vars.add(propVal.value)
			//println "devWrapper size " + devWrapper.getProperty(prop.name).vars.size()

		}
	}
}

oldSetProperty = metaClass.pickMethod("setProperty", [String,Object] as Class[])
metaClass.setProperty = { String name, value ->
	println("set $name = $value")
	Var var = getProperty(name)
	store.impose(eq(var, value))
}

def devices(devType) {
	DEVICES.findAll() {
		it.assetType == devType
	}
}


/* START OF USER SCRIPT */

// static constraints

//dt1.p1 > 1
dt3.p1 > 1
dt3.p2 > dt3.p1
//dt3.p2 == dt3.p1
//dt1.p1 + dt1.p1 > 1

//complex constraints
//devices(dt1).each() {

//}

// dynamic behavior
//dt1.temperature = sin(t)


/* END OF USER SCRIPT */



metaClass.setProperty = oldSetProperty

def search = new DepthFirstSearch()
search.solutionListener.searchAll(false)
SelectChoicePoint select = new InputOrderSelect(store, 
            resultVars as Var[], new IndomainMin()); 
//def select = new SimpleMatrixSelect(resultVars as Var[], new IndomainMin())
def result = search.labeling(store, select)
search.solutionListener.solutionsNo().times { i ->
  println "Solution ${i + 1}:"
  def sol = search.getSolution(i + 1)
  println Arrays.asList(resultStates)
}

return resultStates

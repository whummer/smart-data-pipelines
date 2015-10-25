def payload = "{}"
def file = new File("../regexReplace.groovy").text

def assertThat(value, str) {
	if(!value) throw new Exception(str);
}

/* test: basic object */

def script = 'def payload=\'{"foo":"bar","foo1":"bar1"}\' \n field=\'foo\' \n regex=\'bar\' \n replace=\'123\' \n targetField=null \n' + file;
def obj = evaluate(script)
assert(obj.get("foo") == "123")
assert(obj.get("foo1") == "bar1")

/* test: list of objects */

script = 'def payload=\'[{"foo":"bar"},{"foo1":"bar1"}]\' \n field=\'foo\' \n regex=\'bar\' \n replace=\'123\' \n targetField=null \n' + file;
obj = evaluate(script)
assert(obj[0])
assert(obj[0].get("foo") == "123")
assert(obj[1].get("foo1") == "bar1")

/* test: list of objects with different target field */

script = 'def payload=\'[{"foo":"bar"},{"foo1":"bar1"}]\' \n field=\'foo\' \n regex=\'bar\' \n replace=\'123\' \n targetField=\'foo2\' \n' + file;
obj = evaluate(script)
assert(obj[0])
assert(obj[0].get("foo") == "bar")
assert(obj[0].get("foo2") == "123")
assert(obj[1].get("foo1") == "bar1")


/* test: empty list of objects with different target field */

script = 'def payload=[] \n field=\'foo\' \n regex=\'bar\' \n replace=\'123\' \n targetField=\'foo2\' \n' + file;
obj = evaluate(script)
assert(obj.size() == 0)


/* test: more complex regex */

script = 'def payload=\'{"foo":"POINT (16.38 48.20)"}\' \n field=\'foo\' \n regex=\'POINT\\\\s*\\\\((.*)\\\\s(.*)\\\\)\' \n replace=\'$2 $1\' \n targetField=null \n' + file;
obj = evaluate(script)
assert(obj.get("foo") == "48.20 16.38")



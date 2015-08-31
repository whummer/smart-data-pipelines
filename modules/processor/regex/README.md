# Spring XD - Regex Replacer

## Options

* field - Name of the field to replace
* regex - regex expression (Java syntax)
* replace - replace expression (Java syntax)
* targetField (optional) - name of the target field

## Example

Given a source document, e.g.:

```
{"id":1,"Timestamp":"14:07","SHAPE":"POINT (16.38 48.20)"}
```

... a regex with the following definition:

```
regex --field=SHAPE --targetField=location --regex=POINT\s*\((.*)\s(.*)\) --replace=$2,$1
```

... would transform the source document into the following array of documents:
```
{"id":1,"Timestamp":"14:07","SHAPE":"POINT (16.38 48.20)","location":"48.20,16.38"}
```

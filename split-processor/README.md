# Spring XD - Processor: Message Splitter

Given a source document, e.g.:
http://www.wien.gv.at/wartezeiten/meldeservice/wartezeiten.svc/GetWartezeiten
```
{"MBA1":0,"MBA2":2,"MBA3":5,"IsOpen":false,"Timestamp":"14:07"}
```

... a splitter with the following definition:

```
split --mappings=MBA.*:shortName:waitingTime
```

... would transform the source document into the following array of documents:
```
[
{"shortName":"MBA1","waitingTime":0,"IsOpen":false,"Timestamp":"14:07"},
{"shortName":"MBA2","waitingTime":2,"IsOpen":false,"Timestamp":"14:07"},
{"shortName":"MBA3","waitingTime":5,"IsOpen":false,"Timestamp":"14:07"}
]
```
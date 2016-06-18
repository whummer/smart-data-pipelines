import org.springframework.core.io.*;
import org.springframework.batch.item.*;
import org.springframework.batch.item.file.*;
import org.springframework.batch.item.file.mapping.*;
import org.springframework.batch.item.file.transform.*;
import groovy.json.*

def mappingTable = [
  860435 : "MBA1_8",
  859029 : "MBA2",
  859030 : "MBA3",
  859057 : "MBA4_5",
  859050 : "MBA6_7",
  859042 : "MBA9",
  859032 : "MBA10",
  860422 : "MBA11",
  859051 : "MBA12",
  859058 : "MBA13_14",
  859037 : "MBA15",
  859060 : "MBA16",
  860503 : "MBA17",
  860425 : "MBA18",
  859028 : "MBA19",
  859026 : "MBA20",
  859065 : "MBA21",
  859040 : "MBA22",
  859076 : "MBA23"
];

def resource = new UrlResource(csvFile);
FlatFileItemReader fileReader=new FlatFileItemReader();
fileReader.setResource(resource);
fileReader.setEncoding("UTF-8");
fileReader.setLinesToSkip(1);
DefaultLineMapper lineMapper=new DefaultLineMapper();
DelimitedLineTokenizer tokenizer=new DelimitedLineTokenizer();

def headers = ['FID','OBJECTID','SHAPE','NAME','ADRESSE','SE_ANNO_CAD_DATA'] as String[];
tokenizer.setNames( headers );

FieldSetMapper fieldSetMapper=new PassThroughFieldSetMapper();
lineMapper.setLineTokenizer(tokenizer);
lineMapper.setFieldSetMapper(fieldSetMapper);
fileReader.setLineMapper(lineMapper);

def context = new ExecutionContext();
fileReader.open(context);
def line = null;
def result = [];
while (line = fileReader.read()) {
    println("line: " + line);

  def id = line.readInt("OBJECTID");
  def mba = mappingTable[id];

  if (mba) {
    def geoLoc = line.readString("SHAPE").replace("POINT (", "").replace(")", "").split(" ");
    def entry = [
      "id" : id, 
      "shortName" : mba,
      "name" : line.readString("NAME"),
      "location" : "" + geoLoc[1] + "," + geoLoc[0],
      "address" : line.readString("ADRESSE"),
      "waitingTime" : payload[mba],
      "isOpen" : payload["IsOpen"],
      "time" : payload["Timestamp"],
      "wartekreis" : payload["Wartekreis"],
      "origin" : payload["origin"]
    ]
    payload[mba] = entry;
    //println(entry);
    result << entry;
  }
}
return result;

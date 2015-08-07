'use strict';

var log = global.log || require('winston');
var util = require('util');

function JsonProcessor(json_input) {
  if (!(this instanceof JsonProcessor)) {
    return new JsonProcessor(json_input);
  }
  this.json = json_input;
}

JsonProcessor.prototype.apply = function(callback, errorCallback)  {
  log.debug("JsonProcessor.apply");
  log.debug("name: ", this.json.name);
  log.debug("description: ", this.json.description);

  // build an index for determining prev and next elements (quick an dirty)
  var index = [];
  buildIndex(this.json, index);

  // TODO should write this recurively
  for (var i in this.json.elements){
    var element = this.json.elements[i];
    if (element.class === 'container') {
      processContainer(i, element, index, callback, errorCallback);
    } else {
      processElement(i, -1, element, index, callback, errorCallback);
    }
  }
};


// build index to easily determine next and previous
function buildIndex(json, index) {
  for (var i in json.elements){
    var element = json.elements[i];
    if (element.class === 'container') {
      var subIndex = [];
      buildIndex(element, subIndex)
      index.push(subIndex);
    } else {
      index.push(i);
    }
  }
}

function processContainer(position, element, index, callback, errorCallback) {
  log.debug("Proccessing container element: ", position);
  for (var i in element.elements) {
    processElement(position, i, element.elements[i], index, callback, errorCallback);
  }
}

// FR: total hack for now. need to distingush between classes as well and add some
// "semantic" checks
// TODO improve this somehow with the help of the model classes
function processElement(position, subposition, element, index, callback, errorCallback) {
  var id = ''
  if (subposition > -1)
    id = position + "_" + subposition;
  else
    id = position;

  //log.debug("Proccessing element: %d - %d", position, subposition);

  // dynamically load modules
  var moduleName = util.format("./springxd/%s/%s", element['class'], element['type']);
  var modulez = require(moduleName);
  var args = {
      // "dryrun" : true,
      "id": id,
      "previous_id" : id,
      "next_id" : next(index, position, subposition),
      "options" : element.options
  };
  // execute modules
  modulez(args, callback, errorCallback);
}

function next(index, position, subposition) {
  var idx = Number(position)+1;
  // console.log("IDX debug: ", idx, index[idx], index[idx][subposition], index[idx].length);
  // TODO it does not work without the length check??
  if (index[idx] && index[idx].length > 1 && index[idx][subposition])
    return idx + "_" + subposition;
  else
    return idx;
}

module.exports = JsonProcessor;

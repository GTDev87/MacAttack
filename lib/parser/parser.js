var fs = require("fs"),
  PEG = require("pegjs"),
  c = require('rho-contracts'),
  path = require("path"),
  _ = require("lodash");

module.exports = function (deserializer) {

  function grammarString(fileName) { return fs.readFileSync(path.resolve(__dirname + fileName)).toString();}
  function concatenateGrammarFiles (grammarStringArray) {return grammarStringArray.map(grammarString).join("\n"); }

  var completeGrammer = concatenateGrammarFiles(["/grammar/base.pegjs", "/grammar/function.pegjs"]);

  var mockInterpreter = require(__dirname + "/interpreters/mockInterpreter")(_);
  var mockParser = _.extend({ interpreter: mockInterpreter }, PEG.buildParser(completeGrammer, {allowedStartRules: ["anything"]}));

  var contractInterpreter = require(__dirname + "/interpreters/contract")(_, c); 
  var contractParser = _.extend({ interpreter: contractInterpreter }, PEG.buildParser(completeGrammer, {allowedStartRules: ["anything"]}));

  var requestGrammar = concatenateGrammarFiles(["/grammar/base.pegjs", "/grammar/string.pegjs"]);
  var requestInterpreter = require(__dirname + "/interpreters/request")(_, c, mockParser, contractParser, deserializer);
  var requestParser = _.extend({ interpreter: requestInterpreter }, PEG.buildParser(requestGrammar, {allowedStartRules: ["startfunc"]}));

  return requestParser;
};
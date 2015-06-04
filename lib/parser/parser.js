var fs = require("fs"),
	PEG = require("pegjs"),
	c = require('rho-contracts'),
	path = require("path");

var grammar = fs.readFileSync(path.resolve(__dirname + "/parser.pegjs")).toString();
var parser = PEG.buildParser(grammar);
parser.c = c;

module.exports = parser;
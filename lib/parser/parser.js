var fs = require("fs"),
	PEG = require("pegjs"),
	c = require('rho-contracts'),
	path = require("path"),
	_ = require("lodash");

module.exports = function (deserializer) {
	var grammar = fs.readFileSync(path.resolve(__dirname + "/parser.pegjs")).toString();


	function findRegexCaveatStringInList(caveatList, regex) {
		return _.find(caveatList, function (packet) {return regex.test(packet.getValueAsText()); }).getValueAsText().trim();
	}

	function findCaveatSchema(deserializedMac) {
		var CAVEAT_PREFIX = /schema = .*/;
		var CAVEAT_PREFIX_LEN = "schema = ".length;
		var schema = findRegexCaveatStringInList(deserializedMac.caveatPackets, CAVEAT_PREFIX);
		return schema.substr(CAVEAT_PREFIX_LEN).trim();
	}

	var grammarValidationObj = {
		startfunc: function (args, res) { 
		    var objArgs = args.map(function (arg) { return {x: arg}; });
		    return c.fun.apply(null, objArgs).returns(res); 
		},
		func: function (args, res) { 

			//args is rho contracts args for expected mac
			//results is rho contracts result for expected mac

			//do i create expected args?
			//or do i match?
			

			function macValidation (macMaybe) {
				var deserializedMac = deserializer(macMaybe);
				var schema = findCaveatSchema(deserializedMac);


				// need to call mock parser with mock setting
				// maybe parser takes different arguments
				// make 2 differnet parsers mock parser and top level parser
				// one returns contract through rho-contract
				// the other returns a mock.
				debugger;
				console.log("macValidation schema = %j", schema);

				console.log("args = %j", args);
				console.log("result = %j", result);

				return true;
			}

			
			//inside c.string there maybe be a validator
			return c.and(c.pred(macValidation), c.string);
		},
		tuple: function (args) { 
			return c.tuple.apply(null, args); 
		},
		array: function (args) {
			return c.array.apply(null, args); 
		},
		map: function (args) {
			return c.hash.apply(null, args); 
		},
		object: function (pairs) { 
			return c.object(pairs.reduce(function(agg, pair) {
			  agg[pair[0]] = pair[1];
			  return agg; 
			}, {}));
		},
		int: function () {
			return c.integer;
		},
		str: function () {
			return c.string;
		},
		num: function () {
			return c.number;
		},
		bool: function () {
			return c.bool;
		},
		void: function () {
			return c.nothing;
		}
	}

	return _.extend({
		grammarValidationObj: grammarValidationObj
	}, PEG.buildParser(grammar));
};
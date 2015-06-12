var fs = require("fs"),
	PEG = require("pegjs"),
	c = require('rho-contracts'),
	path = require("path"),
	_ = require("lodash");

module.exports = function (deserializer) {
	var grammar = 
		[
			fs.readFileSync(path.resolve(__dirname + "/grammar/base.pegjs")).toString(),
			fs.readFileSync(path.resolve(__dirname + "/grammar/string.pegjs")).toString()
		].join("\n");


	function findRegexCaveatStringInList(caveatList, regex) {
		return _.find(caveatList, function (packet) {return regex.test(packet.getValueAsText()); }).getValueAsText().trim();
	}

	function findCaveatSchema(deserializedMac) {
		var CAVEAT_PREFIX = /schema = .*/;
		var CAVEAT_PREFIX_LEN = "schema = ".length;
		var schema = findRegexCaveatStringInList(deserializedMac.caveatPackets, CAVEAT_PREFIX);
		return schema.substr(CAVEAT_PREFIX_LEN).trim();
	}

	// var mockParser = _.extend({
	// 	grammarValidationObj: mockValidationObj
	// }, PEG.buildParser(grammar));


	//Make 3 parsers with the same core language
	//The parsing works regularly until a macaroon is detectedj

	//parser 1:
	//  Parses Structure of Security Api Macaroon.  
	//  This parser constructs the validator for the logic of signature endpoints
	//  This Validator only validates request and response down to the level of finding other macaroons.
	//  This means that if the sturcture is parsed and it detects a macaroon it will create a parser 2 and parse the as a string and decode it
	//  In the decoding a second parer is constructed

	//parser 2:
	//  Parses structure of macaroon all the way down to the bottom.
	//  This will as dictated do redundant parsing as parse 1 // one wonders if the structure of parse 1 can be reused
	//  This parser creates validator all the way down to the root (does not worry about macaroons for functions)
	//  Functions are parsed and validated as they are parsed.

	//parser 3:
	//  Parses Request Data
	//  This will parse the request data and create mock data when it hits a macaoon.
	//  The macaroon will be fully mocked and fed to parser 2.



	// var mockValidationObj = {
	// 	startfunc: function (args, res) {
	// 		//expected mac
	// 		//passing back something to be checked by parser;
	// 		//in args and in res

	// 		//comparing against what?
	// 		//TODO figure this out

	// 		//how to check (() -> int) ?

	// 	    var newFun = function () {
	// 	    	return res;
	// 	    };
	// 	    return newFun; 
	// 	},
	// 	func: function (args, res) { 
	// 		//expected mac
	// 		//passing back something to be checked by parser;
	// 		//in args and in res

	// 		//comparing against what?
	// 		//TODO figure this out

	// 	    var newFun = function () {
	// 	    	return res;
	// 	    };
	// 	    return newFun; 
	// 	},
	// 	tuple: function (args) { 
	// 		return args;
	// 	},
	// 	array: function (args) {
	// 		return [args]; 
	// 	},
	// 	map: function (args) {
	// 		return {a: args}; 
	// 	},
	// 	object: function (pairs) { 
	// 		return c.object(pairs.reduce(function(agg, pair) {
	// 		  agg[pair[0]] = pair[1];
	// 		  return agg; 
	// 		}, {}));
	// 	},
	// 	int: function () {
	// 		return 1;
	// 	},
	// 	str: function () {
	// 		return "a";
	// 	},
	// 	num: function () {
	// 		return 1.2;
	// 	},
	// 	bool: function () {
	// 		return true;
	// 	},
	// 	void: function () {
	// 		return;
	// 	}
	// };

	var baseValidationParser = {
		startfunc: function (args, res) {
			var objArgs = args.map(function (arg, idx) { return _.object([idx],[arg]); });
		    return c.fun.apply(null, objArgs).returns(res); 
		},
		func: function(args, res) {
			var objArgs = args.map(function (arg, idx) { return _.object([idx],[arg]); });
		    return c.fun.apply(null, objArgs).returns(res); 
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
	};

	// var macaroonValidationParser = _.extend({
	// 	grammarValidationObj: requestMacaroonValidationObject
	// }, PEG.buildParser(grammar))

	var functionValidationParser =  {
		func: function (expectedArgsTree, expectedReturnTree) { 
			debugger;

			var expectedArgs = _.flatten(expectedArgsTree).join("");
			var expectedReturn = _.flatten(expectedReturnTree).join("");


			//using grammar validation contracts
			//what does it mean when another function is encountered?

			//args is a fully constructed validator for arguments
			//res is a fully constructed validator for returns

			//args is rho contracts args for expected mac
			//results is rho contracts result for expected mac

			//do i create expected args?
			//or do i match?


			function macValidation (macMaybe) {

				debugger;


				//this is the macaroon... what is passed into data would ideally be transformed.
				//

				//this is a string in the request as a macaroon
				

				// need to call mock parser with mock setting
				// maybe parser takes different arguments
				// make 2 differnet parsers mock parser and top level parser
				// one returns contract through rho-contract
				// the other returns a mock.



				var deserializedMac = deserializer(macMaybe);
				var actualRequestMacSchema = findCaveatSchema(deserializedMac);

				console.log("expectedArgs = %j", expectedArgs);
				console.log("expectedReturn = %j", expectedReturn);
				console.log("actualRequestMacSchema = %j", actualRequestMacSchema);

				//schema is signature from the macaroon in the request.  Needs to be validated

				

				var passMock = true;

				var funSchemaObj = mockParser.parse(actualRequestMacSchema);

				try{

					// argsValid.
					// resValid.
					
				}catch(e){
					passMock = false;
					console.log("e.message = %j", e.message)
				}

				return passMock;
			}

			
			//inside c.string there maybe be a validator
			return c.and(c.pred(macValidation), c.string);
		}
	};

	var requestValidationParser = _.extend(baseValidationParser, functionValidationParser);



	return _.extend({
		grammarValidationObj: requestValidationParser
	}, PEG.buildParser(grammar));
};
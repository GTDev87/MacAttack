var fs = require("fs"),
	PEG = require("pegjs"),
	c = require('rho-contracts'),
	path = require("path"),
	_ = require("lodash");

module.exports = function (deserializer) {

	function grammarString(fileName) { return fs.readFileSync(path.resolve(__dirname + fileName)).toString();}
	function concatenateGrammarFiles (grammarStringArray) {return grammarStringArray.map(grammarString).join("\n"); }

	var requestGrammar = concatenateGrammarFiles(["/grammar/base.pegjs", "/grammar/string.pegjs"]);
	var completeGrammer = concatenateGrammarFiles(["/grammar/base.pegjs", "/grammar/function.pegjs"]);

	function findRegexCaveatStringInList(caveatList, regex) {
		return _.find(caveatList, function (packet) {return regex.test(packet.getValueAsText()); }).getValueAsText().trim();
	}

	function findCaveatSchema(deserializedMac) {
		var CAVEAT_PREFIX = /schema = .*/;
		var CAVEAT_PREFIX_LEN = "schema = ".length;
		var schema = findRegexCaveatStringInList(deserializedMac.caveatPackets, CAVEAT_PREFIX);
		return schema.substr(CAVEAT_PREFIX_LEN).trim();
	}

	var contractInterpreter = {
		startfunc: function (argsValidator, returnValidator) {
			var objArgs = _.map(argsValidator, function (arg, idx) { return _.object([idx],[arg]); });
		    var functionValidator = c.fun.apply(null, objArgs).returns(returnValidator); 

			function predValidation (func) {

				console.log("argsValidator = %j", argsValidator);
				console.log("returnValidator = %j", returnValidator);
				console.log("objArgs = %j", objArgs);
				console.log("functionValidator = %j", functionValidator);

				debugger;

				var wrappedFunction = functionValidator.wrap(func);
				var pass = true;

				try { wrappedFunction.apply(null, func.args); }
				catch(e) { pass = false; console.log("e.message = %j", e.message);}
				
				return pass;
			}
			
			return c.and(c.pred(predValidation), functionValidator);
		},
		func: function (argsValidator, returnValidator) {

			var objArgs = _.map(argsValidator, function (arg, idx) { return _.object([idx],[arg]); });
		    var functionValidator = c.fun.apply(null, objArgs).returns(returnValidator); 

			function macValidation (func) {

				var wrappedFunction = functionValidator.wrap(func);
				var pass = true;

				try { wrappedFunction.apply(null, func.args); }
				catch(e) { pass = false; console.log("e.message = %j", e.message);throw e;}
				
				return pass;
			}

			return c.and(c.pred(macValidation), functionValidator);
		},
		tuple: function (args) { return c.tuple.apply(null, args); },
		array: function (args) { return c.array.apply(null, args); },
		map: function (args) { return c.hash.apply(null, args); },
		object: function (pairs) { return c.object(_.object(pairs)); },
		int: function () { return c.integer; },
		str: function () { return c.string; },
		num: function () { return c.number; },
		bool: function () { return c.bool; },
		void: function () { return c.nothing; }
	};

	var mockInterpreter = {
		startfunc: function (args, res) {
			var newFun = function () { return res; };
		    newFun.args = args;
		    return newFun; 
		},
		func: function (args, res) { 

		    var newFun = function () { return res; };
		    newFun.args = args;
		    return newFun; 
		},
		tuple: function (args) { return args; },
		array: function (arg) { return [arg]; },
		map: function (arg) {return {a: arg}; },
		object: function (pairs) { return _.object(pairs); },
		int: function () { return 1; },
		str: function () { return "abc"; },
		num: function () { return -1.2; },
		bool: function () { return true; },
		void: function () { return; }
	};

	var baseInterpreter = {
		startfunc: function (args, res) {
			var objArgs = args.map(function (arg, idx) { return _.object([idx],[arg]); });
		    return c.fun.apply(null, objArgs).returns(res); 
		},
		func: function(args, res) {
			var objArgs = args.map(function (arg, idx) { return _.object([idx],[arg]); });
		    return c.fun.apply(null, objArgs).returns(res); 
		},
		tuple: function (args) { return c.tuple.apply(null, args); },
		array: function (args) { return c.array.apply(null, args); },
		map: function (args) { return c.hash.apply(null, args); },
		object: function (pairs) { return c.object(_.object(pairs)); },
		int: function () { return c.integer; },
		str: function () { return c.string; },
		num: function () { return c.number; },
		bool: function () { return c.bool; },
		void: function () { return c.nothing; }
	};

	var contractParser = _.extend({ interpreter: contractInterpreter }, PEG.buildParser(completeGrammer));
	var mockParser = _.extend({ interpreter: mockInterpreter }, PEG.buildParser(completeGrammer));

	var functionStringInterpreter =  {
		func: function (expectedArgsTree, expectedReturnTree) { 

			var expectedArgs = _.flatten(expectedArgsTree).join("");
			var expectedReturn = _.flatten(expectedReturnTree).join("");

			function macValidation (macMaybe) {

				// debugger;

				var deserializedMac = deserializer(macMaybe);
				var actualRequestMacSchema = findCaveatSchema(deserializedMac);

				console.log("expectedArgs = %j", expectedArgs);
				console.log("expectedReturn = %j", expectedReturn);
				console.log("actualRequestMacSchema = %j", actualRequestMacSchema);

				//schema is signature from the macaroon in the request.  Needs to be validated

				var pass = true;

				try{
					var andFunctionContract = contractParser.parse("(("+expectedArgs+")->"+expectedReturn+")");
					var functionContract = _.find(andFunctionContract.contracts, function (cont) {return cont.contractName === "fun"});

					var mockMacFn = mockParser.parse(actualRequestMacSchema);

					debugger;
					var wrappedMacFn = functionContract.wrap(mockMacFn);
					wrappedMacFn(mockMacFn.args);
					
				}catch(e){
					pass = false;
					console.log("e.message = %j", e.message);
					throw e;
				}

				return pass;
			}
			return c.and(c.pred(macValidation), c.string);
		}
	};

	var requestInterpreter = _.extend(baseInterpreter, functionStringInterpreter);
	var requestParser = _.extend({ interpreter: requestInterpreter }, PEG.buildParser(requestGrammar));

	return requestParser;
};
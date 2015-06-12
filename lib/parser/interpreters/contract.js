module.exports = function (_, c) {
	return {
		startfunc: function (argsValidator, returnValidator) {
			var objArgs = _.map(argsValidator, function (arg, idx) { return _.object([idx],[arg]); });
		    var functionValidator = c.fun.apply(null, objArgs).returns(returnValidator); 

			function predValidation (func) {
				var wrappedFunction = functionValidator.wrap(func);
				var pass = true;

				try { wrappedFunction.apply(null, func.args); }
				catch(e) { pass = false; console.log("e.message = %j", e.message);throw e;}
				
				return pass;
			}
			
			return c.and(c.pred(predValidation), functionValidator);
		},
		func: function (argsValidator, returnValidator) {

			var objArgs = _.map(argsValidator, function (arg, idx) { return _.object([idx],[arg]); });
		    var functionValidator = c.fun.apply(null, objArgs).returns(returnValidator); 

			function predValidation (func) {

				var wrappedFunction = functionValidator.wrap(func);
				var pass = true;

				try { wrappedFunction.apply(null, func.args); }
				catch(e) { pass = false; console.log("e.message = %j", e.message);throw e;}
				
				return pass;
			}

			return c.and(c.pred(predValidation), functionValidator);
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
};
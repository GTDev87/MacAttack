module.exports = function (_, c) {
	//interpreting function as {_args: "args", _return: "return"} may be a gaping security hole
	return {
		func: function (argsValidator, returnValidator) { return c.object({_args: argsValidator, _return: returnValidator}); },
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
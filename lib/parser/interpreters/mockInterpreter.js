module.exports = function (_) {
	//interpreting function as {_args: "args", _return: "return"} may be a gaping security hole
	return {
		func: function (args, res) {return {_args: args, _return: res}; },
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
};
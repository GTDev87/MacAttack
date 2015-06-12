module.exports = function (_) {
	return {
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
};
var fs = require("fs"),
	PEG = require("pegjs"),
	c = require('rho-contracts'),
	path = require("path"),
	_ = require("lodash");

module.exports = function (deserializer) {
	var grammar = fs.readFileSync(path.resolve(__dirname + "/parser.pegjs")).toString();


	function findCaveatSchema(deserializedMac) {

		return "int";
	}

	return _.extend({
		c: c,
		macValidate: function (args, result){

			//args is rho contracts args for expected mac
			//results is rho contracts result for expected mac

			//do i create expected args?
			//or do i match?

			function macValidation (macMaybe) {
				var deserializedMac = deserializer(macMaybe);
				var schema = findCaveatSchema(deserializedMac);
				console.log("macValidation macMaybe = [%j]", macMaybe);
				console.log("macValidation deserializedMac.inspect() = %j", deserializedMac.inspect());
				return true;
			}

			
			//inside c.string there maybe be a validator
			return c.and(c.pred(macValidation), c.string);
		}
	}, PEG.buildParser(grammar));
};
var MacAttack = require("../lib/macattack")

var urlMac = MacAttack.createMac("http://macattack.com", "/api/length", "my secret", "(([{\"a\": num}...]) -> num)");
console.log("urlMac = %j", urlMac);

var valid = MacAttack.validateMacFunction(urlMac, "/api/length", "my secret", [{a: 1}, {a: 2}, {a: 3}], function (arrayObjs) {
	return arrayObjs.length;
});
console.log("MacAttack.validateMacFunction valid = %j", valid);

valid = MacAttack.validateMac(urlMac, "/api/length", "my secret", [{a: 1}, {a: 2}, {a: 3}]);
console.log("MacAttack.validateMac valid = %j", valid);


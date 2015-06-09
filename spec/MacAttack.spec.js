var MacAttack = require("../lib/macattack");
var parser = require("../lib/parser/parser");

var urlMac = MacAttack.createMac("http://macattack.com", "my secret", "/api/length", "GET", "(([{\"a\": num}...]) -> num)");
console.log("urlMac = %j", urlMac);

var valid = MacAttack.validateMacFunction(urlMac, "my secret", "/api/length", "GET", [{a: 1}, {a: 2}, {a: 3}], function (arrayObjs) {
	return arrayObjs.length;
});
console.log("MacAttack.validateMacFunction valid = %j", valid);

valid = MacAttack.validateMac(urlMac, "my secret", "/api/length", "GET", [{a: 1}, {a: 2}, {a: 3}]);
console.log("MacAttack.validateMac valid = %j", valid);

// parser.parse("(([{\"a\": num}...]) -> num)");
try{
	var invalidSchemaMac = MacAttack.createMac("http://macattack.com", "my secret", "/api/length", "GET", "(([{\"a\": num}...]) -> num");
	console.log("invalidSchemaMac = %j", invalidSchemaMac);
}catch (e){
	console.log("good eror");
}



// var urlMac2 = MacAttack.createMac("http://macattack.com", "my secret", "/api/create", "POST", "(({\"title\": str}) -> (({}) -> {\"title\": str}))");
// console.log("urlMac = %j", urlMac);

// var urlMac2 = MacAttack.createMac("http://macattack.com", "my secret", "/api/create", "GET", "(((({}) -> {\"title\": str})) -> {\"title\": str})");
// console.log("urlMac = %j", urlMac);
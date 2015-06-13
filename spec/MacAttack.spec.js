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



//////testing inbed macaroons

var urlGetterMac = MacAttack.createMac("http://macattack.com", "my secret", "/api/length", "GET", "(({}) -> num)");
console.log("urlGetterMac = %j", urlGetterMac);

var urlGetterConsumerMac = MacAttack.createMac("http://macattack.com", "my secret", "/api/length", "GET", "(({\"a\": num, \"b\": (({}) -> num)}) -> num)");
console.log("urlGetterConsumerMac = %j", urlGetterConsumerMac);

var urlGetterNotConsumerMac = MacAttack.createMac("http://macattack.com", "my secret", "/api/length", "GET", "(({\"a\": num, \"b\": (({}) -> str)}) -> num)");
console.log("urlGetterNotConsumerMac = %j", urlGetterNotConsumerMac);

console.log("testing getting right function mac");
valid = MacAttack.validateMac(urlGetterConsumerMac, "my secret", "/api/length", "GET", {a: 1, b: urlGetterMac});
console.log("MacAttack.validateMac valid = %j", valid);

console.log("testing getting wrong function mac");
notValid = MacAttack.validateMac(urlGetterNotConsumerMac, "my secret", "/api/length", "GET", {a: 1, b: urlGetterMac});
console.log("MacAttack.validateMac notValid = %j", notValid);


var lessComplicatedMac = MacAttack.createMac("http://macattack.com", "my secret", "/api/length", "GET", "(({}) -> (({}) -> num))");
console.log("lessComplicatedMac = %j", lessComplicatedMac);

var lessComplicatedWrongMac = MacAttack.createMac("http://macattack.com", "my secret", "/api/length", "GET", "(({}) -> (({}) -> str))");
console.log("lessComplicatedWrongMac = %j", lessComplicatedWrongMac);

var complicatedMac = MacAttack.createMac("http://macattack.com", "my secret", "/api/length", "GET", "(({\"a\": num, \"b\": (({}) -> (({}) -> num))}) -> num)");
console.log("complicatedMac = %j", complicatedMac);

console.log("testing getting right function mac");
valid = MacAttack.validateMac(complicatedMac, "my secret", "/api/length", "GET", {a: 1, b: lessComplicatedMac});
console.log("should be right valid = %j", valid);

console.log("testing getting wong function mac");
valid = MacAttack.validateMac(complicatedMac, "my secret", "/api/length", "GET", {a: 1, b: lessComplicatedWrongMac});
console.log("should be wrong valid = %j", valid);

// parser.parse("(([{\"a\": num}...]) -> num)");
try{
	var invalidSchemaMac = MacAttack.createMac("http://macattack.com", "my secret", "/api/length", "GET", "(([{\"a\": num}...]) -> num");
	console.log("invalidSchemaMac = %j", invalidSchemaMac);
}catch (e){
	console.log("good eror");
}

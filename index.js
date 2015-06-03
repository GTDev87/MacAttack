var MacaroonsBuilder = require('macaroons.js').MacaroonsBuilder,
	MacaroonsVerifier = require('macaroons.js').MacaroonsVerifier,
	sys = require('sys'),
	c = require('rho-contracts'),
	PEG = require("pegjs"),
	fs = require("fs"),
	path = require("path");


var grammar = fs.readFileSync(path.resolve(__dirname + "/parser/parser.pegjs")).toString();

var parser = PEG.buildParser(grammar);
parser.c = c;


var res = parser.parse("((int)->num)");

function schemaVerifierCreater(requestData, apiquery) {
	var CAVEAT_PREFIX = /schema = .*/;
	var CAVEAT_PREFIX_LEN = "schema = ".length;

	var apiFn = apiquery;
	return function schemaVerifier(caveat) {


	    if (CAVEAT_PREFIX.test(caveat)) {
	    	
	    	var schemaString = caveat.substr(CAVEAT_PREFIX_LEN).trim();

	    	var pass = true;
	    	var funValidator = parser.parse(schemaString)

	    	var wrappedFn = funValidator.wrap(apiFn);

	    	try{
	    		var answer = wrappedFn(requestData);
	    		pass = true;
	    	}catch(e){
	    		pass = false;
	    	}
	    	return pass;

	    }
	    return false;
	}
}

var macTest = module.exports = {
  createMac: function(url, route, databaseSecret, schema) {

	var identifier = "Mac Attack Protocol";
	var urlMacaroon = new MacaroonsBuilder(url, databaseSecret, identifier)
		 .add_first_party_caveat("route = " + route)
		 .add_first_party_caveat("schema = " + schema)
		.getMacaroon();


	return urlMacaroon.serialize();
  },
  validateMac: function (serializedMac, route, databaseSecret, requestData, apiquery) {
  	//need to honor requestData!!!!!
  	
  	var urlMacaroon = MacaroonsBuilder.deserialize(serializedMac);
  	var verifier = new MacaroonsVerifier(urlMacaroon);
  	verifier.satisfyExact("route = " + route);
  	verifier.satisfyGeneral(schemaVerifierCreater(requestData, apiquery));
  	return verifier.isValid(databaseSecret);
  }
};

var urlMac = macTest.createMac("http://macattack.com", "/api/length", "my secret", "(([{\"a\": num}...]) -> num)");
console.log("urlMac = %j", urlMac);

var valid = macTest.validateMac(urlMac, "/api/length", "my secret", [{a: 1}, {a: 2}, {a: 3}], function (arrayObjs) {
	return arrayObjs.length;
});
console.log("valid = %j", valid);



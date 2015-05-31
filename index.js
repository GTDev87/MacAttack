var MacaroonsBuilder = require('macaroons.js').MacaroonsBuilder,
	MacaroonsVerifier = require('macaroons.js').MacaroonsVerifier,
	sys = require('sys');



function schemaVerifierCreater(requestData) {
	var CAVEAT_PREFIX = /schema = .*/;
	var CAVEAT_PREFIX_LEN = "schema = ".length;
	return function schemaVerifier(caveat) {
	    if (CAVEAT_PREFIX.test(caveat)) {
	    	var schemaString = caveat.substr(CAVEAT_PREFIX_LEN).trim();

	    	console.log("comparing");
	    	console.log("requestData = %j", requestData);
	    	console.log("schemaString = %j", schemaString);

	    	return schemaString === "([{a: Number}]) -> (Number)";

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
  validateMac: function (serializedMac, route, databaseSecret, requestData) {
  	//need to honor requestData!!!!!

  	var urlMacaroon = MacaroonsBuilder.deserialize(serializedMac);

  	var verifier = new MacaroonsVerifier(urlMacaroon);
  	verifier.satisfyExact("route = " + route);
  	verifier.satisfyGeneral(schemaVerifierCreater(requestData));

  	return verifier.isValid(databaseSecret);

  }
};

var urlMac = macTest.createMac("http://macattack.com", "/api/add", "my secret", "([{a: Number}]) -> (Number)");

console.log("urlMac = %j", urlMac);

var valid = macTest.validateMac(urlMac, "/api/add", "my secret", [{a: 1}, {a: 2}, {a: 3}]);

console.log("valid = %j", valid);



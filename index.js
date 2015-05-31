var MacaroonsBuilder = require('macaroons.js').MacaroonsBuilder,
	MacaroonsVerifier = require('macaroons.js').MacaroonsVerifier,

	sys = require('sys');




var macTest = module.exports = {
  createMac: function(url, route, databaseSecret, schema) {

	var identifier = "Mac Attack Protocol";
	var urlMacaroon = new MacaroonsBuilder(url, databaseSecret, identifier)
		 .add_first_party_caveat("route = " + route)
		.getMacaroon();


	return urlMacaroon.serialize();
  },
  validateMac: function (serializedMac, route, databaseSecret, requestData) {
  	//need to honor requestData!!!!!

  	var urlMacaroon = MacaroonsBuilder.deserialize(serializedMac);

  	var verifier = new MacaroonsVerifier(urlMacaroon);
  	verifier.satisfyExact("route = " + route);

  	return verifier.isValid(databaseSecret);

  }
};

var urlMac = macTest.createMac("http://macattack.com", "/api/add", "my secret", "[{a: Number}] -> Number");

console.log("urlMac = %j", urlMac);

var valid = macTest.validateMac(urlMac, "/api/add", "my secret", [{a: 1}, {a: 2}, {a: 3}]);

console.log("valid = %j", valid);



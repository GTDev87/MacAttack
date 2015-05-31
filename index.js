var MacaroonsBuilder = require('macaroons.js').MacaroonsBuilder,
	MacaroonsVerifier = require('macaroons.js').MacaroonsVerifier,

	sys = require('sys');




var macTest = module.exports = {
  createMac: function(url, routeSecret, schema) {

	var identifier = "Mac Attack Protocol";
	var urlMacaroon = new MacaroonsBuilder(url, routeSecret, identifier)
		// .add_first_party_caveat("schema = " + schema)
		.getMacaroon();


	return urlMacaroon.serialize();
  },
  validateMac: function (serializedMac, routeSecret, requestData) {
  	//need to honor requestData!!!!!

  	var urlMacaroon = MacaroonsBuilder.deserialize(serializedMac);

  	var verifier = new MacaroonsVerifier(urlMacaroon);
  	return verifier.isValid(routeSecret);

  }
};

var urlMac = macTest.createMac("http://macattack.com/api/add", "my secret", "[{a: Number}] -> Number");

console.log("urlMac = %j", urlMac);

var valid = macTest.validateMac(urlMac, "my secret", [{a: 1}, {a: 2}, {a: 3}]);

console.log("valid = %j", valid);



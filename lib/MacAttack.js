var MacaroonsBuilder = require('macaroons.js').MacaroonsBuilder,
	MacaroonsVerifier = require('macaroons.js').MacaroonsVerifier,
	parser = require("./parser/parser"),
	schemaVerifierCreater = require("./macaroon/schemaVerifierCreater");

module.exports = {
  createMac: function(url, route, databaseSecret, schema) {

  	var identifier = "Mac Attack Protocol";
  	var urlMacaroon = new MacaroonsBuilder(url, databaseSecret, identifier)
  		 .add_first_party_caveat("route = " + route)
  		 .add_first_party_caveat("schema = " + schema)
  		.getMacaroon();

    return urlMacaroon.serialize();
  },
  validateMacFunction: function (serializedMac, route, databaseSecret, requestData, apiquery) {
  	//need to honor requestData!!!!!
  	var urlMacaroon = MacaroonsBuilder.deserialize(serializedMac);
  	var verifier = new MacaroonsVerifier(urlMacaroon);
  	verifier.satisfyExact("route = " + route);
  	verifier.satisfyGeneral(schemaVerifierCreater(parser, requestData, apiquery).verifyFunction);
  	return verifier.isValid(databaseSecret);
  },
  validateMac: function (serializedMac, route, databaseSecret, requestData) {
    //need to honor requestData!!!!!
    var urlMacaroon = MacaroonsBuilder.deserialize(serializedMac);
    var verifier = new MacaroonsVerifier(urlMacaroon);
    verifier.satisfyExact("route = " + route);
    verifier.satisfyGeneral(schemaVerifierCreater(parser, requestData).verifyArguments);
    return verifier.isValid(databaseSecret);
  }
};
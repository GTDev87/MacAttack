var macaroons = require('macaroons.js'),
  MacaroonsBuilder = macaroons.MacaroonsBuilder,
	MacaroonsVerifier = macaroons.MacaroonsVerifier,
	parser = require("./parser/parser")(MacaroonsBuilder.deserialize),
	schemaVerifierCreater = require("./macaroon/schemaVerifierCreater");

module.exports = {
  createMac: function(url, databaseSecret, route, action, schema) {

  	var identifier = "Mac Attack Protocol";
    
    try{
      parser.parse(schema);
    }catch(e){
      throw new Error("schema is not valid: " + e.message);
    }
        
  	var urlMacaroon = new MacaroonsBuilder(url, databaseSecret, identifier)
       .add_first_party_caveat("route = " + route)
  		 .add_first_party_caveat("action = " + action.toLowerCase())
  		 .add_first_party_caveat("schema = " + schema)
  		.getMacaroon();

    return urlMacaroon.serialize();
  },
  validateMacFunction: function (serializedMac, databaseSecret, route, action, requestData, apiquery) {
  	//need to honor requestData!!!!!
    var deserializerFn = MacaroonsBuilder.deserialize;
  	var urlMacaroon = deserializerFn(serializedMac);
  	var verifier = new MacaroonsVerifier(urlMacaroon);
    verifier.satisfyExact("route = " + route);
  	verifier.satisfyExact("action = " + action.toLowerCase());
  	verifier.satisfyGeneral(schemaVerifierCreater(parser, requestData, apiquery).verifyFunction);
  	return verifier.isValid(databaseSecret);
  },
  validateMac: function (serializedMac, databaseSecret, route, action, requestData) {
    //need to honor requestData!!!!!
    var deserializerFn = MacaroonsBuilder.deserialize;
    var urlMacaroon = deserializerFn(serializedMac);
    var verifier = new MacaroonsVerifier(urlMacaroon);
    verifier.satisfyExact("route = " + route);
    verifier.satisfyExact("action = " + action.toLowerCase());
    verifier.satisfyGeneral(schemaVerifierCreater(parser, requestData).verifyArguments);
    return verifier.isValid(databaseSecret);
  }
};

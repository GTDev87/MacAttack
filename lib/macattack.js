var macaroons = require('macaroons.js'),
  MacaroonsBuilder = macaroons.MacaroonsBuilder,
	MacaroonsVerifier = macaroons.MacaroonsVerifier,
	parser = require("./parser/parser")(MacaroonsBuilder.deserialize),
	schemaVerifierCreater = require("./macaroon/schemaVerifierCreater");

module.exports = {
  createMac: function(ip, port, databaseSecret) {
    var identifier = "Mac Attack Protocol";
    
    var location = ip + ":" + port;
        
    var urlMacaroon = new MacaroonsBuilder(location, databaseSecret, identifier).getMacaroon();

    return urlMacaroon.serialize();
  },
  createMacWithSchema: function(ip, port, databaseSecret, schema) {
  	var identifier = "Mac Attack Protocol";
    
    var location = ip + ":" + port;
    try{ parser.parse(schema); }
    catch(e){ throw new Error("schema is not valid: " + e.message); }
        
  	var urlMacaroon = new MacaroonsBuilder(location, databaseSecret, identifier)
  		.add_first_party_caveat("schema = " + schema)
  		.getMacaroon();

    return urlMacaroon.serialize();
  },
  addSchema: function (serializedMac, schema){
    var locMacaroon = MacaroonsBuilder.modify(MacaroonsBuilder.deserialize(serializedMac))
      .add_first_party_caveat("schema = " + schema)
      .getMacaroon();

    return locMacaroon.serialize();
  },
  validateMacFunction: function (serializedMac, databaseSecret, requestData, apiquery) {
  	//need to honor requestData!!!!!
  	var verifier = new MacaroonsVerifier(MacaroonsBuilder.deserialize(serializedMac));
  	verifier.satisfyGeneral(schemaVerifierCreater(parser, requestData, apiquery).verifyFunction);
  	return verifier.isValid(databaseSecret);
  },
  validateMac: function (serializedMac, databaseSecret, requestData) {
    //need to honor requestData!!!!!
    var verifier = new MacaroonsVerifier(MacaroonsBuilder.deserialize(serializedMac));
    verifier.satisfyGeneral(schemaVerifierCreater(parser, requestData).verifyArguments);
    return verifier.isValid(databaseSecret);
  },
  validateMacWithChannel: function (serializedMac, databaseSecret, requestData) {
    //need to honor requestData!!!!!
    //add 3rd party caveat channel for creating TLS connection.
    var verifier = new MacaroonsVerifier(MacaroonsBuilder.deserialize(serializedMac));
    verifier.satisfyGeneral(schemaVerifierCreater(parser, requestData).verifyArguments);
    return verifier.isValid(databaseSecret);
  }
};

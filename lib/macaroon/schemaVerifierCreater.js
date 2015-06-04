

module.exports = function schemaVerifierCreater(parser, requestData, apiquery) {
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





module.exports = function schemaVerifierCreater(parser, requestData, apiquery) {
	var CAVEAT_PREFIX = /schema = .*/;
	var CAVEAT_PREFIX_LEN = "schema = ".length;
	var apiFn = apiquery;
	return {
		verifyFunction: function (caveat) {
		    if (CAVEAT_PREFIX.test(caveat)) {
		    	
		    	var schemaString = caveat.substr(CAVEAT_PREFIX_LEN).trim();
	
		    	var pass = true;
		    	var funValidator = parser.parse(schemaString);
	
		    	var wrappedFn = funValidator.wrap(apiFn);
	
		    	try{
		    		wrappedFn(requestData);
		    	}catch(e){
		    		pass = false;
		    	}
		    	return pass;
	
		    }
		    return false;
		},
		verifyArguments: function (caveat) {
		    if (CAVEAT_PREFIX.test(caveat)) {
		    	
		    	var schemaString = caveat.substr(CAVEAT_PREFIX_LEN).trim();
	
		    	var pass = true;
		    	var funValidator = parser.parse(schemaString);

		    	try{
		    		funValidator.argumentContracts.map(function (arg) { return arg.check(requestData); });
		    	}catch(e){
		    		pass = false;
		    	}
		    	return pass;
	
		    }
		    return false;
		}
	}
}



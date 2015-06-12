func
  = _ "(" _ "(" _ args:functionargs _ ")" _ "->" _ res:anything _ ")" _ { 
    return grammarValidationObj.func(args, res);
  }
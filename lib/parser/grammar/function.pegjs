func
  = _ "(" _ "(" _ args:functionargs _ ")" _ "->" _ res:anything _ ")" _ { 
    return interpreter.func(args, res);
  }
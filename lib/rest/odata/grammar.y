/* Description: Odata Filter Query Grammar */

/* lexical grammar */
%lex
%options flex case-insensitive
%%

\s+                              /* Skip newline */
\n+                              /* Skip whitespace */
\t+                              /* Skip tabs */
/* Logical operators */
"Eq"                             return 'Eq';
"Ne"                             return 'Ne';
"Gt"                             return 'Gt';
"Ge"                             return 'Ge';
"Lt"                             return 'Lt';
"Le"                             return 'Le';
"And"                            return 'And';
"Or"                             return 'Or';
"Not"                            return 'Not';
/* Search */
"Lk"                             return 'Lk';
/* Arithmetic operators */
"Add"                            return 'Add';
"Sub"                            return 'Sub';
"Mul"                            return 'Mul';
"Div"                            return 'Div';
"Mod"                            return 'Mod';
/* Grouping operators */
"("                              return '(';
")"                              return ')';
","                              return ',';
/* Types */
\'[^\']+\'                       return 'STRING';
[0-9]+("."[0-9]+)?\b             return 'NUMBER';
"null"                           return 'NULL';
"true"                           return 'TRUE';
"false"                          return 'FALSE';
/* Others */
[$_a-zA-Z]+([0-9$_a-zA-Z]+)?\b   return 'IDENTIFIER';
<<EOF>>                          return 'EOF';

/lex

/* Operator associations and precedence */
%left 'And' 'Or' 'Not'
%left 'Eq' 'Ne'
%left 'Lt' 'Le'
%left 'Gt' 'Ge'
%left 'Lk'
%left 'Add' 'Sub'
%left 'Mul' 'Div' 'Mod'


%start expressions

%% /* language grammar */

expressions
    : e EOF
        { return $1 }
    ;

/* Function */
val
    : e
        { $$ = $1 }
    ;

args
    : val
        { $$ = [$1] }
    | args ',' val
        { $$ = $1.concat([$3]) }
    ;

func
    : 'IDENTIFIER' '(' ')'
        { $$ = new yy.Function($1, []) }
    | 'IDENTIFIER' '(' args ')'
        { $$ = new yy.Function($1, $3) }
    ;

e
    /* Grouping */
    : '(' e ')'
        { $$ = $2 }
    /* Functions */
    | func
        { $$ = $1 }
    /* Operators */
    | e 'Eq' e
        { $$ = new yy.Expression($2, $1, $3) }
    | e 'Ne' e
        { $$ = new yy.Expression($2, $1, $3) }
    | e 'Gt' e
        { $$ = new yy.Expression($2, $1, $3) }
    | e 'Ge' e
        { $$ = new yy.Expression($2, $1, $3) }
    | e 'Lt' e
        { $$ = new yy.Expression($2, $1, $3) }
    | e 'Le' e
        { $$ = new yy.Expression($2, $1, $3) }
    | e 'And' e
        { $$ = new yy.Expression($2, $1, $3) }
    | e 'Or' e
        { $$ = new yy.Expression($2, $1, $3) }
    | e 'Not' e
        { $$ = new yy.Expression($2, $1, $3) }
    | e 'Lk' e
        { $$ = new yy.Expression($2, $1, $3) }
    | e 'Add' e
        { $$ = new yy.Expression($2, $1, $3) }
    | e 'Sub' e
        { $$ = new yy.Expression($2, $1, $3) }
    | e 'Mul' e
        { $$ = new yy.Expression($2, $1, $3) }
    | e 'Div' e
        { $$ = new yy.Expression($2, $1, $3) }
    | e 'Mod' e
        { $$ = new yy.Expression($2, $1, $3) }
    /* Types */
    | NULL
        { $$ = yy.NULL }
    | TRUE
        { $$ = yy.TRUE }
    | FALSE
        { $$ = yy.FALSE }
    | STRING
        { $$ = String(yytext).replace(/\'/g, '') }
    | NUMBER
        { $$ = Number(yytext) }
    | IDENTIFIER
        { $$ = new yy.Identifier(yytext) }
    ;

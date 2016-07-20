/**
*
*   SyntaxHighlighterGrammar
*   @version: @@VERSION@@
*
*   Transform a grammar specification in JSON format, into a syntax-highlight brush for SyntaxHighlighter
*   https://github.com/foo123/syntaxhighlighter-grammar
*   https://github.com/foo123/editor-grammar
*
**/


//
// parser factories
var SyntaxHighlighterParser = Class(Parser, {
    constructor: function SyntaxHighlighterParser( grammar, DEFAULT ) {
        var self = this;
        Parser.call(self, grammar, "plain", "plain");
        self.DEF = DEFAULT || self.$DEF;
        self.ERR = /*grammar.Style.error ||*/ self.$ERR;
    }
    
    // get token via multiplexing inner grammars if needed
    ,get: function( stream, mode ) {
        var ret = mode.parser.token( stream, mode.state, mode.inner );
        while ( ret && ret.parser )
        {
            // multiplex inner grammar/parser/state if given
            // save inner parser current state
            if ( ret.fromInner && (mode.parser !== ret.parser) )
            {
                mode.state.err = ret.fromInner.err;
                mode.state.pos = ret.fromInner.pos;
                if ( mode.name ) mode.inner[mode.name] = ret.fromInner;
            }
            // share some state
            ret.state.err = mode.state.err;
            ret.state.line = mode.state.line;
            ret.state.bline = mode.state.bline;
            ret.state.$blank$ = mode.state.$blank$;
            ret.state.$eol$ = mode.state.$eol$;
            ret.state.pos = mode.state.pos;
            ret.state.$full_parse$ = mode.state.$full_parse$;
            // update parser to current parser and associated state
            mode.state = ret.state;
            mode.parser = ret.parser;
            mode.name = ret.toInner;
            // get new token
            ret = mode.parser.get( stream, mode );
        }
        // return token
        return ret;
    }
    
    ,tokenize: function( stream, mode, row ) {
        var self = this, tokens = [], token, buf = [], id = null,
            plain_token = function( t ){ t.type = self.$DEF; return t; };
        //mode.state.line = row || 0;
        if ( undef === mode.state.pos ) mode.state.pos = 0;
        if ( stream.eol() ) { mode.state.line++; if ( mode.state.$blank$ ) mode.state.bline++; }
        else while ( !stream.eol() )
        {
            token = mode.parser.get( stream, mode );
            token.pos = mode.state.pos; mode.state.pos += token.token.length;
            if ( mode.state.$actionerr$ )
            {
                if ( buf.length ) tokens = tokens.concat( map( buf, plain_token ) );
                token.type = self.$DEF; tokens.push( token );
                buf.length = 0; id = null;
            }
            else
            {
                if ( id !== token.name )
                {
                    if ( buf.length ) tokens = tokens.concat( buf );
                    buf.length = 0; id = token.name;
                }
                buf.push( token );
            }
        }
        if ( buf.length ) tokens = tokens.concat( buf );
        buf.length = 0; id = null;
        return tokens;
    }
});


function get_mode( grammar, SyntaxHighlighter ) 
{
    var shToken = function( t ) { return new SyntaxHighlighter.Match(t.token, t.pos, t.type); }
        ,HighlighterBrush = SyntaxHighlighter.Highlighter
        ,SyntaxHighlighterBrush = Class(HighlighterBrush, {
            constructor: function SyntaxHighlighterBrush( ) {
                var self = this;
                HighlighterBrush.call( self );
            }
            ,findMatches: function( regexList, code ) {
                var escaped = SyntaxHighlighterBrush.escapeHtml;
                if ( escaped )
                {
                    // de-escape any html entities
                    code = de_esc_html( code );
                }
                
                var tokens = SyntaxHighlighterBrush.$parser.parse(code, TOKENS|ERRORS|FLAT).tokens;
                
                if ( escaped )
                {
                    // re-escape any html entities
                    var pos = 0;
                    iterate( function( i, tokens ){
                        var t = tokens[i];
                        t.pos = pos;
                        t.token = esc_html( t.token, 1 );
                        pos += t.token.length;
                    }, 0, tokens.length-1, tokens );
                }
                
                return map( tokens, shToken );
            }
        })
    ;
    SyntaxHighlighterBrush.$id = uuid("syntaxhighlighter_grammar_brush");
    SyntaxHighlighterBrush.$parser = new SyntaxHighlighterGrammar.Parser( parse_grammar( grammar ) );
    SyntaxHighlighterBrush.escapeHtml = true;
    SyntaxHighlighterBrush.submode = function( lang, mode ) {
        SyntaxHighlighterBrush.$parser.subparser( lang, mode.$parser );
    };
    SyntaxHighlighterBrush.dispose = function( ) {
        if ( SyntaxHighlighterBrush.$parser ) SyntaxHighlighterBrush.$parser.dispose( );
        SyntaxHighlighterBrush.$parser = null;
    };
	//SyntaxHighlighterBrush.aliases = [lang];
	//SyntaxHighlighter.brushes[lang] = SyntaxHighlighterBrush;
    return SyntaxHighlighterBrush;
}


//
//  SyntaxHighlighter Grammar main class
/**[DOC_MARKDOWN]
*
* ###SyntaxHighlighterGrammar Methods
*
* __For node:__
*
* ```javascript
* SyntaxHighlighterGrammar = require('build/syntaxhighlighter_grammar.js');
* ```
*
* __For browser:__
*
* ```html
* <script src="build/syntaxhighlighter_grammar.js"></script>
* ```
*
[/DOC_MARKDOWN]**/
var SyntaxHighlighterGrammar = {
    
    VERSION: "@@VERSION@@",
    
    // clone a grammar
    /**[DOC_MARKDOWN]
    * __Method__: `clone`
    *
    * ```javascript
    * cloned_grammar = SyntaxHighlighterGrammar.clone( grammar [, deep=true] );
    * ```
    *
    * Clone (deep) a `grammar`
    *
    * Utility to clone objects efficiently
    [/DOC_MARKDOWN]**/
    clone: clone,
    
    // extend a grammar using another base grammar
    /**[DOC_MARKDOWN]
    * __Method__: `extend`
    *
    * ```javascript
    * extended_grammar = SyntaxHighlighterGrammar.extend( grammar, basegrammar1 [, basegrammar2, ..] );
    * ```
    *
    * Extend a `grammar` with `basegrammar1`, `basegrammar2`, etc..
    *
    * This way arbitrary `dialects` and `variations` can be handled more easily
    [/DOC_MARKDOWN]**/
    extend: extend,
    
    // pre-process a grammar (in-place)
    /**[DOC_MARKDOWN]
    * __Method__: `pre_process`
    *
    * ```javascript
    * pre_processed_grammar = SyntaxHighlighterGrammar.pre_process( grammar );
    * ```
    *
    * This is used internally by the `SyntaxHighlighterGrammar` Class `parse` method
    * In order to pre-process a `JSON grammar` (in-place) to transform any shorthand configurations to full object configurations and provide defaults.
    * It also parses `PEG`/`BNF` (syntax) notations into full (syntax) configuration objects, so merging with other grammars can be easier if needed.
    [/DOC_MARKDOWN]**/
    pre_process: preprocess_and_parse_grammar,
    
    // parse a grammar
    /**[DOC_MARKDOWN]
    * __Method__: `parse`
    *
    * ```javascript
    * parsed_grammar = SyntaxHighlighterGrammar.parse( grammar );
    * ```
    *
    * This is used internally by the `SyntaxHighlighterGrammar` Class
    * In order to parse a `JSON grammar` to a form suitable to be used by the syntax-highlighter.
    * However user can use this method to cache a `parsedgrammar` to be used later.
    * Already parsed grammars are NOT re-parsed when passed through the parse method again
    [/DOC_MARKDOWN]**/
    parse: parse_grammar,
    
    // get an SyntaxHighlighter-compatible brush from a grammar
    /**[DOC_MARKDOWN]
    * __Method__: `getMode`
    *
    * ```javascript
    * mode = SyntaxHighlighterGrammar.getMode( grammar, SyntaxHighlighter );
    * ```
    *
    * This is the main method which transforms a `JSON grammar` into a syntax-highlighter brush for `SyntaxHighlighter`.
    [/DOC_MARKDOWN]**/
    getMode: get_mode,
    
    // make Parser class available
    /**[DOC_MARKDOWN]
    * __Parser Class__: `Parser`
    *
    * ```javascript
    * Parser = SyntaxHighlighterGrammar.Parser;
    * ```
    *
    * The Parser Class used to instantiate a highlight brush parser, is available.
    * The `getMode` method will instantiate this parser class, which can be overriden/extended if needed, as needed.
    * In general there is no need to override/extend the parser, unless you definately need to.
    [/DOC_MARKDOWN]**/
    Parser: SyntaxHighlighterParser
};

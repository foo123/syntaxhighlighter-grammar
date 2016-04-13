function syntaxhighlighter_grammar_demo(code, langs)
{
    document.getElementById('editor-version').innerHTML = '3.0.83';
    document.getElementById('grammar-version').innerHTML = SyntaxHighlighterGrammar.VERSION;
    var main_lang, main_mode;
    for (var i=0,l=langs.length; i<l; i++)
    {
        if ( 0 === i )
        {
            // main  mode
            main_lang = langs[i].language;
            main_mode = SyntaxHighlighterGrammar.getMode( langs[i].grammar, SyntaxHighlighter );
            main_mode.aliases = [ main_lang ];
        }
        else
        {
            // submodes
            main_mode.submode(langs[i].language, SyntaxHighlighterGrammar.getMode( langs[i].grammar, SyntaxHighlighter ));
        }
    }
    var brushName = main_lang.charAt(0).toUpperCase() + main_lang.slice(1).toLowerCase();
    SyntaxHighlighter.brushes[ brushName ] = main_mode;
    SyntaxHighlighter.highlight( {brush: main_lang}, code );
}
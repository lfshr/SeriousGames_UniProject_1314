

main.game.help = (function(){
    var help1 = "<div class='solveScreenTitle'>Remember!</div>\n\
                <div class='solveScreenExplain'>Don't forget the formulae for solving speed distance and time!</div>\n\
                <img src='./image/DST.png' width='100px' height='100px' style='display:inline-block;'/>\n\
                <hr>";
    
    var help2 = "<div class='solveScreenTitle'>Please Ask Your Instructor for Help</div>"
    
    var timeout;
    
    function ShowHelp( num, duration ){
        switch(num){
            case 1:
                ShowHelpText( help1 );
                break;
            case 2:
                ShowHelpText( help2 );
                break;
        }
        if( timeout )clearInterval( timeout );
        timeout = setTimeout( function(){
            HideHelp();
        }, duration );
    }
    
    function ShowHelpText( text ){
        $(".mistakeHelper").html( text );
        main.ShowElement( "mistakeHelper" );
    }
    
    function HideHelp(){
        main.HideElement( "mistakeHelper" );
    }
    
    return{
        ShowHelp : ShowHelp,
        ShowHelpText : ShowHelpText,
        HideHelp : HideHelp
    };
})();
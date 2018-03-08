
main = (function (){
    
    var dom = main.dom, 
        $ = dom.$;
        
    var engine = main.engine,
        game = main.game;
        
    var configFileUrl = "./config/config.xml";
    var config = engine.LoadXMLFile( configFileUrl ).getElementsByTagName("config")[0];
    
    var secondaryScreens = [];
    
    
    engine.AddUpdateFunction(game.Update);
    
    console.log("Current time is: "+engine.getTime());
    
    function showScreen( screenId, resetActiveScreen ){
        
        if( resetActiveScreen === undefined )resetActiveScreen = true;
        
        var activeScreen = $("#game .active").toArray(),
                screen = $("#" + screenId)[0];
        console.log("ScreenId = "+screenId);
        if( activeScreen && resetActiveScreen ){
            activeScreen.forEach( function( a ){
                dom.removeClass( a, "active" );
            });
            
        }
        dom.addClass( screen, "active" );
        
        switch( screenId ){
            case 'game-screen':
                main.game.assessment.ResetAll();
                showScreen( "calculator", false );
                game.StartGame( 1 );
                console.log("Game Running");
                break;
        }
    }
    
    function ShowElement( elementID ){
        $("#"+elementID).addClass("active");
    }
    
    function HideElement( elementID ){
        $("#"+elementID).removeClass("active");
    }
    
    function HideScreen( screenId ){
        var screen = $("#"+screenId);
        
        if( screen ){
            dom.removeClass(screen, "active");
        }
    }
    
    function ReturnConfig(){
        return config;
    }
    
    return{
        showScreen : showScreen,
        engine : engine,
        game : game,
        config : ReturnConfig(),
        HideScreen : HideScreen,
        ShowElement : ShowElement,
        HideElement : HideElement
    };
})();
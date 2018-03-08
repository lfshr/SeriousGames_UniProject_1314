
main.engine = (function(){
    var deltaTime = 0.0, timeLastFrame = getTime();
    var interval = 33.33;
    var UpdateFunctions = [];
    
    var Vector2 = function(x,y) {
        var tx = 0;
        var ty = 0;
        if( x )tx = x;
        if( y )ty = y;
            
        return{
            x : tx,
            y : ty,
            zero : Vector2
        };
    };
    
    var Line = function(from, to){
        return{
            pointFrom : from,
            pointTo : to
        };
    };
    
    window.setInterval(Update, interval);
    
    function Update(){
        //console.log("Length: "+UpdateFunctions);
        var t = getTime();
        deltaTime = (t - timeLastFrame) / 1000;
        timeLastFrame = t;
        
        //console.log("deltaTime:"+ deltaTime);
        
        for( var i = 0; i < UpdateFunctions.length; i++ ){
            //console.log("UPDATE");
            
            UpdateFunctions[i]();
        }
    }
    
    function DistanceBetween( pointA, pointB ){
        var x = pointA.x - pointB.x;
        var y = pointA.y - pointB.y;
        //console.log(pointA);
        //console.log(pointB);
        //console.log("Distance between point: "+Math.sqrt((x*x) + (y*y)) );
        return Math.sqrt(x*x + y*y);
    }
    
    function DeltaTime(){
        return deltaTime;
    }
    
    function AddUpdateFunction( func ){
        //console.log("Adding Function To Engine.Update: "+func);
        if( func )
            UpdateFunctions.push(func);
        else
            console.error( "Invalid function parsed in sg_engine.AddUpdateFunction" );
        
        //console.log("UpdateFunctions: "+UpdateFunctions)
    }
    
    function LoadXMLFile ( url ){
        if( window.XMLHttpRequest ){
            xmlhttp = new XMLHttpRequest();
        }else{
            xmlhttp = new ActiveXObject("Microsot.XMLHTTP");
        }
        
        xmlhttp.open("GET", url, false);
        xmlhttp.send();
        xmlDoc = xmlhttp.responseXML;
        
        if( !xmlDoc ){
            console.log("*** ERROR: No xmlDoc for url \""+url+"\" : "+xmlDoc+" ***");
            return;
        }
        
        /*console.log( "xmlDoc: "+xmlDoc);
        console.log( "LevelName: "+ GetXMLElement( "LevelName" ) );
        console.log( "xmlDoc Levels: "+levs.toString());
        console.log("Vals :"+vals);*/
        
        return xmlDoc;
    }
    
    function GetLevelXML( level ){
        var ret;
        console.log("Loading Level "+level);
        if( main.config ){
            console.log("Main Config File Variable Found : "+main.config);
            var levConfig = main.config.getElementsByTagName("Level"+level)[0];
            return levConfig;
        }else{
            console.log("*** Error: No main config : "+main.config+" ***");
        }
    }
    
    function GetXMLElement( element ){
        return xmlDoc.getElementsByTagName( element )[0].childNodes[0].nodeValue;
    }
    
    function DeepXMLLookup( nodes, whitespace ){
        if( !whitespace )whitespace = "";
        var ret = [];
        var value = function(name, value){
            return{
                name : name,
                value : value
            };
        };
        
        var val = [];
        
        if( nodes.nodeValue ){
            if( nodes.nodeValue.trim().length > 0 ){
                console.log(whitespace+": "+nodes.nodeValue);
                val[0] = new value( nodes.parentNode.tagName, nodes.nodeValue );
            }
        }
        
        for( var i = 0; i < nodes.childNodes.length; i++ ){
            if( nodes.childNodes[i] ){
                 console.log( whitespace+nodes.tagName+"{");
                 var look = DeepXMLLookup( nodes.childNodes[i], whitespace+"   " );
                 for( var x = 0; x < look.length; x++ ){
                     val.push(look[x]);
                 }
                 console.log( whitespace+"}" );
            }
        }
        for( var i = 0; i < val.length; i++ ){
            if( val[i] )
                ret.push( val[i] );
        }
        return ret;
    }
    
    function getTime(){
        var d = new Date();
        return d.getTime();
    }
    
    function LineTest( L1, L2 ){ // (main.engine.Line, main.engine.Line)
        
        var a = L1.pointFrom, b = L1.pointTo,
            c = L2.pointFrom, d = L2.pointTo;
        
        var denom = ((b.x - a.x) * (d.y - c.y)) - ((b.y - a.y) * (d.x - c.x));
        var num1  = ((a.y - c.y) * (d.x - c.x)) - ((a.x - c.x) * (d.y - c.y));
        var num2  = ((a.y - c.y) * (b.x - a.x)) - ((a.x - c.x) * (b.y - a.y));
        
        
        if( denom === 0){
            return null;
        }
        
        //console.log("Denominator "+denom);
        
        var x = num1 / denom;
        var y = num2 / denom;
        
        if( (x >= 0 && x <= 1) && (y >= 0 && y <= 1) ){
            var vec = new Vector2();
            vec.x = num1;
            vec.y = num2;
            //console.log("Collision Point = "+vec.x+" , "+vec.y);
            return vec;
        }else{
            return null;
        }
        
        //COMPLETE GARBAGE!!! Was I drunk? :S
        /*//var distance = DistanceBetween( L1, L2 );
        var a1, a2, b1, b2, c1, c2, denom;
        //var InterceptPoint;
        
        a1 = L1.pointTo.x - L1.pointFrom.x;
        b1 = L1.pointFrom.y - L1.pointTo.y;
        c1 = L1.pointTo.x*L1.pointFrom.y - L1.pointFrom.x*L1.pointTo.y;
        
        a2 = L2.pointFrom.y - L2.pointTo.y;
        b2 = L2.pointTo.x - L2.pointFrom.x;
        c2 = L2.pointTo.x*L2.pointFrom.y - L2.pointFrom.x*L2.pointTo.y;
        
        denom = a1*b2 - a2*b1;
        
        if( denom === 0 ){
            console.log("Line Does Not Intersect!");
            return null;
        }
        
        var x = ( b1*c2 - b2*c1 )/denom;
        var y = ( a2*c2 - a1*c1 )/denom;
        
        var vec = new Vector2();
        vec.x = x;
        vec.y = y;
        return vec;
        //return new Vector2( x, y );*/
    }
    
    return{
        deltaTime : DeltaTime,
        getTime : getTime,
        AddUpdateFunction : AddUpdateFunction,
        Vector2 : Vector2,
        DistanceBetween : DistanceBetween,
        LoadXMLFile : LoadXMLFile,
        DeepXMLLookup : DeepXMLLookup,
        GetXMLElement : GetXMLElement,
        GetLevelXML : GetLevelXML,
        Line : Line,
        LineTest : LineTest
    };
})();

main.engine.assessment = (function() {
    // Put code here
    
    function AddScore(user, score){
        // Add Score to user
    }
    
    function RetrieveScores( user ){
        // Return array of all scores the user has previously done
    }
    
    return {
      AddScore: AddScore,
      RetrieveScores: RetrieveScores
    };
})();
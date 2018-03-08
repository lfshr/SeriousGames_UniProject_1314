
main.game = (function(){
    var gameRunning = false;
    var debugTools = {
        debugRouteSpawns : false,
        debugRoutePointNumbers : false
    };
    
    var canvas = $("#game-canvas")[0];
    
    console.log( canvas );
    console.log( canvas.offset );
    //var canvasOffset = new e.Vector2( canvas.offsetLeft, canvas.offsetRight );
    
    canvas.addEventListener( "click", function(event){ HandleClick(event); } , false );
    var e = main.engine;
    var currentLevel = 0;
    var minSpeed = 2;
    var maxSpeed = 20;
    var speedUnit = "m/s";
    var distanceModifier = 1;
    var distanceUnit = " meters";
    var timeUnit = " seconds";
    var ScreenIsDirty = false;
    var OnlyRefreshOnDirty = false;
    
    var minDistanceBetweenRoutePoints = 50;
    
    var controlDefaultHTML;
    
    var routePointImage = new Image();
    routePointImage.src = main.resources.sg_routePointImage;
    routePointImage.width = 1; routePointImage.height = 1;
    
    var routePoint = function(){
        var connectedPoints = new Array();
        var connectionLines = new Array();
        function isConnectedTo( point ){
            for( var i = 0; i < connectedPoints.length; i++ ){
                if( connectedPoints[0] === point ){
                    return true;
                }else return false;
            }
        }
        
        function ConnectTo( point ){
            if( !isConnectedTo( point ) ){
                connectedPoints.push( point );
                point.connectedPoints.push( this );
                var con = new routeConnection( this, point );
                var speed = Math.random() * (maxSpeed - minSpeed) + minSpeed;
                //speed = (Math.round( speed * 100 ) / 100);
                var dist = e.DistanceBetween( this.pos, point.pos );
                //dist = (Math.round( dist * 100 ) / 100);
                var time = dist/speed;
                speed = Math.round( speed * 100 ) / 100;
                dist = Math.round( dist * 100 ) / 100;
                time = Math.round( time * 100 ) / 100;
                var tSpeed = speed;
                var tDist = dist;
                var tTime = time;
                speed = Math.round((tDist / tTime) * 100) / 100;
                dist = Math.round((tSpeed * tTime) * 100) / 100;
                tTime = Math.round( (tDist / tSpeed) * 100) / 100;
                //speed = Math.round( speed * 100 ) / 100;
                //dist = Math.round( dist * 100 ) / 100;
                //time = Math.round( time * 100 ) / 100;
                con.speed = speed;
                con.distance = dist;
                con.time = time;
                con.toCalculate = Math.floor(Math.random() * 3);
                console.log("Set connection toCalc as "+con.toCalculate);
                routeConnections.push( con );
                connectionLines.push( con );
                point.connectionLines.push( con );
            }
        }
        
        return{
            pos : new e.Vector2(0,0),
            connectedPoints : connectedPoints,
            image : routePointImage,
            radius : 10,
            fill : true,
            outerColour : "#ff0000",
            strokeThickness : 3,
            strokeColour : "#990000",
            stroke : false,
            active : false,
            isConnectedTo : isConnectedTo,
            ConnectTo : ConnectTo,
            connectionLines : connectionLines
        };
    };
    
    var routeConnection = function(p1, p2){
        var speed = null;
        var distance = null;
        var time = null;
        var toCalculate = -1; //-1 : error; 0 : speed; 1 : distance; 2 : time;
        
        function SetSDT( s, d, t ){
            if( s ){
                console.log( "Setting speed to "+s);
                speed = s;
            }
            if( d ){
                distance = d;
            }
            if( t ){
                time = t;
            }
        }
        return{
            pos1 : p1,
            pos2 : p2,
            speed : speed,
            distance : distance,
            time : time,
            color : "#990000",
            toCalculate : toCalculate,
            solved : false,
            SetSDT : SetSDT
        };
    };
    
    var SPEED = 0;
    var DISTANCE = 1;
    var TIME = 2;
    
    var text = new Array();
    var Text = function( t, xx, yy, fStyle, col, time ){
        var text = t;
        var x = xx;
        var y = yy;
        var fontStyle = fStyle;
        var lifetime = time * 30;
        var colour = col;
        if( colour === undefined )
            colour = "#990000";
        console.log({ text:text, x:x, y:y, fontStyle:fontStyle, lifetime : lifetime });
        
        return{
            text : text,
            x : x,
            y : y,
            fontStyle : fontStyle,
            lifetime : lifetime,
            colour : colour
        };
    };
    
    var UIfont = "20px fantasy";
    var scoreText = new Text("  Score:  0", 10, 60, UIfont, "#666666");
    var streakText = new Text("Streak: x0", 10, 80, UIfont, "#666666");
    var levelText = new Text("#LEVEL_NAME", 400, 30, UIfont, "#666666");
    
    var routeConnections = new Array();
    
    var errorLines = [];
    var moveToLines = [];
    
    var routePoints = [];
    var maxRoutePoints = 10;
    
    var defWidth = 900, 
        defHeight = 600;
        
    var startRoutePoint = new routePoint();
    startRoutePoint.pos.x = 50;
    startRoutePoint.pos.y = defHeight - 50;
    startRoutePoint.strokeColour = "#55DD55";
    startRoutePoint.active = true;
    var finishRoutePoint = new routePoint();
    finishRoutePoint.pos.x = defWidth - 50;
    finishRoutePoint.pos.y = 50;
        
    console.log("Game Canvas: "+canvas);
    
    function Update(){
        if( !gameRunning )return;
        //console.log("Update : delta: "+main.engine.deltaTime());
        //routePoints[0].pos.x = routePoints[0].pos.x + (10 * main.engine.deltaTime());
        //CalculatePoints();
        
        if( ScreenIsDirty || !OnlyRefreshOnDirty )
            Draw();
    }
    
    function SetDirty(){
        ScreenIsDirty = true;
    }
    
    function LoadLevel( level ){
        var conf = e.GetLevelXML(level);
        
        if( !conf ){
            // Assume we have reached the end of the game and quit
            main.showScreen("results_screen");
        }
        console.log("Level File: ");
        console.log( conf );
        
        levelText.text = conf.getElementsByTagName("LevelName")[0].childNodes[0].nodeValue;
        maxRoutePoints = parseInt(conf.getElementsByTagName("MaxRoutePoints")[0].childNodes[0].nodeValue);
        minDistanceBetweenRoutePoints = parseInt(conf.getElementsByTagName("MinDistance")[0].childNodes[0].nodeValue);
        
        StartGame();
        
        //TODO: Load values from config
    }
    
    function LoadNextLevel( ){
        currentLevel++;
        LoadLevel( currentLevel );
    }
    
    function FinishLevel(){
        
        text.push( new Text("Finished Level!", 300, 300, "60px fantasy", "#009900", 3) );
        
        setTimeout( function(state){
            LoadNextLevel();
        }, 3000);
    }
    
    function Draw(){
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0 , 0, canvas.width, canvas.height);
        //ctx.fillStyle="#ECE9F5";
        ctx.fillStyle="#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        
        for( var i = 0; i < routeConnections.length; i++ ){
            var c = routeConnections[i];
            DrawLine( ctx, new e.Line( c.pos1.pos, c.pos2.pos ), c.color );
        }
        
        var r = routePoints[0];
            //ctx.drawImage( r.image, r.pos.x, r.pos.y, r.size * widthMultiplier, r.size * heightMultiplier );
            ctx.fillStyle = r.outerColour;
            //console.log(r.outerColour);
            ctx.beginPath();
                ctx.arc( r.pos.x, r.pos.y, r.radius, 0, 2*Math.PI );
                if( r.fill )
                    ctx.fill();
                ctx.strokeStyle = r.strokeColour;
                ctx.lineWidth = r.strokeThickness;
                if( r.stroke )
                    ctx.stroke();
            ctx.closePath();
            ctx.beginPath();
                ctx.font="20px fantasy";
                ctx.fillStyle = "#999999";
                ctx.fillText("Start", r.pos.x - (r.radius / 2) - 18, r.pos.y + (r.radius / 2) - 20);
            ctx.closePath();
            
        var r = routePoints[routePoints.length-1];
            //ctx.drawImage( r.image, r.pos.x, r.pos.y, r.size * widthMultiplier, r.size * heightMultiplier );
            ctx.fillStyle = r.outerColour;
            //console.log(r.outerColour);
            ctx.beginPath();
                ctx.arc( r.pos.x, r.pos.y, r.radius, 0, 2*Math.PI );
                if( r.fill )
                    ctx.fill();
                ctx.strokeStyle = r.strokeColour;
                ctx.lineWidth = r.strokeThickness;
                if( r.stroke )
                    ctx.stroke();
            ctx.closePath();
            ctx.beginPath();
                ctx.font="20px fantasy";
                ctx.fillStyle = "#999999";
                ctx.fillText("End", r.pos.x - (r.radius / 2) - 10, r.pos.y + (r.radius / 2) - 20);
            ctx.closePath();
        
        for( var i = 1; i < routePoints.length-1; i++ ){
            r = routePoints[i];
            //ctx.drawImage( r.image, r.pos.x, r.pos.y, r.size * widthMultiplier, r.size * heightMultiplier );
            ctx.fillStyle = r.outerColour;
            //console.log(r.outerColour);
            ctx.beginPath();
                ctx.arc( r.pos.x, r.pos.y, r.radius, 0, 2*Math.PI);
                if( r.fill )
                    ctx.fill();
                ctx.strokeStyle = r.strokeColour;
                ctx.lineWidth = r.strokeThickness;
                if( r.stroke )
                    ctx.stroke();
            ctx.closePath();
            if( debugTools.debugRoutePointNumbers ){
                ctx.beginPath();
                    ctx.font="20px Georgia";
                    ctx.fillStyle = "#000000";
                    ctx.fillText(i, r.pos.x - (r.radius / 2), r.pos.y + (r.radius / 2));
                ctx.closePath();
            }
        }
        
        if( debugTools.routePointSpawn ){
            for( var i = 0; i < errorLines.length; i++ ){
                var l = errorLines[i];
                ctx.beginPath();
                    ctx.lineWidth = 3;
                    ctx.strokeStyle = "#FF0000";
                    ctx.moveTo( l.pointFrom.x, l.pointFrom.y );
                    ctx.lineTo( l.pointTo.x, l.pointTo.y );
                    ctx.stroke();
                    ctx.fillStyle = "#FF0000";
                
                    ctx.font="20px Georgia";
                    ctx.fillText(Math.floor(e.DistanceBetween(l.pointFrom, l.pointTo)),
                                l.pointTo.x - ((l.pointTo.x - l.pointFrom.x) / 2), l.pointTo.y - ((l.pointTo.y - l.pointFrom.y) / 2));
                ctx.closePath();
            }
        
            for( var i = 0; i < moveToLines.length; i++ ){
                var m = moveToLines[i];
            
                ctx.beginPath();
                    ctx.lineWidth = 3;
                    ctx.strokeStyle = "#0000FF";
                    ctx.moveTo( m.pointFrom.x, m.pointFrom.y );
                    ctx.lineTo( m.pointTo.x, m.pointTo.y );
                    ctx.stroke();
                ctx.closePath();
            }
        }
        
        DrawText( ctx, levelText );
        DrawText( ctx, scoreText );
        DrawText( ctx, streakText );
        
        text.forEach( function( e, i ){
            DrawText( ctx, e );
            
            e.lifetime--;
            if( e.lifetime <= 0 ){
                text.splice( i, 1 );
            }
        });
        /*var line1 = new e.Line( new e.Vector2( 10, 10), new e.Vector2(400, 400) );
        var line2 = new e.Line( new e.Vector2( 10, 400 ), new e.Vector2( 400, 10) );
        
        ctx.beginPath();
        ctx.strokeStyle = "#000099";
        ctx.lineWidth = "3px";
        ctx.moveTo( line1.pointFrom.x, line1.pointFrom.y );
        ctx.lineTo( line1.pointTo.x, line1.pointTo.y );
        ctx.stroke();
        ctx.closePath();
        
        ctx.beginPath();
        ctx.strokeStyle = "#009900";
        ctx.lineWidth = "3px";
        ctx.moveTo( line2.pointFrom.x, line2.pointFrom.y );
        ctx.lineTo( line2.pointTo.x, line2.pointTo.y );
        ctx.stroke();
        ctx.closePath();
        
        var intersect = e.LineTest( line1, line2 );
        if( intersect ){
            //console.log("Intesect Point = ",intersect.x+","+intersect.y);
            ctx.beginPath();
            ctx.fillStyle = "#990000";
            ctx.arc( intersect.x, intersect.y, 5, 0, Math.PI*2 );
            ctx.fill();
            ctx.closePath();
        }*/
        
        ScreenIsDirty = false;
    }// End Draw
    
    function DrawText( ctx, textIn ){
        ctx.beginPath();
            ctx.fillStyle = textIn.colour;
            ctx.font = textIn.fontStyle;
            ctx.fillText( textIn.text, textIn.x, textIn.y );
        ctx.closePath();
    }
    
    function HandleClick( event ){
        var off = $('#game-canvas').offset();
        //var vec = new e.Vector2( event.pageX - off.left, event.PageY - off.top );
        var vec = new e.Vector2();
        vec.x = event.pageX - off.left;
        vec.y = event.pageY - off.top;
        console.log("Clicked on "+(event.pageX - off.left)+","+(event.pageY - off.top));
        console.log( event );
        
        var lineRad = 15;
        
        var lineV1 = new e.Vector2();
        lineV1.x = vec.x + lineRad;
        lineV1.y = vec.y + lineRad;
        
        var lineV2 = new e.Vector2();
        lineV2.x = vec.x - lineRad;
        lineV2.y = vec.y - lineRad;
        
        var lineV3 = new e.Vector2();
        lineV3.x = vec.x - lineRad;
        lineV3.y = vec.y + lineRad;
        
        var lineV4 = new e.Vector2();
        lineV4.x = vec.x + lineRad;
        lineV4.y = vec.y - lineRad;
        
        var line1 = new e.Line();
        line1.pointFrom = lineV1;
        line1.pointTo = lineV2;
        
        var line2 = new e.Line();
        line2.pointFrom = lineV3;
        line2.pointTo = lineV4;
        
        DrawLine( canvas.getContext("2d"), line1 );
        DrawLine( canvas.getContext("2d"), line2 );
        
        for( var i = 0; i < routeConnections.length; i++ ){
            var r = new e.Line();
            r.pointFrom = routeConnections[i].pos1.pos;
            r.pointTo = routeConnections[i].pos2.pos;
            
            if( e.LineTest( r, line1 ) || e.LineTest( r, line2 ) ){
                console.log("Hit Route Connection "+i);
                StartRouteSolve(i);
                return;
            }
        }
        
        for( var i = 0; i < routePoints.length; i++ ){
            var r = routePoints[i];
            //console.log("Distance between click and point "+i+" is "+e.DistanceBetween( vec, r.pos )+" x="+r.pos.x+" y="+r.pos.y);
            if( e.DistanceBetween( vec, r.pos ) < r.radius ){
                console.log( "Clicked Point "+i );
                console.log(routePoints[i]);
            }
        }
        
        //console.log("Setting answer html to default");
        //$('.game-control').html( controlDefaultHTML );
    }
    
    function StartRouteSolve( routeIdx ){
        var r = routeConnections[routeIdx];
        var html = "";
        //"<div class='solveScreenTitle'>Route Connection "+(routeInd+1)+"</div>";
        
        routeConnections.forEach( function( c ){
            if( c.solved ){
                c.color = "#009900";
            }else{
                c.color = "#990000";
            }
        });
        
        r.color = "#CCCCCC";
        
        var calc1Text = "";
        var calc2Text = "";
        
        var answer;
        var units;
        
        if( r.toCalculate === SPEED ){
            html+= "<div class='solveScreenTitle'>Calculate The Speed Limit on Route "+(routeIdx+1)+".</div>";
            html+= "<div class='solveScreenExplain'>We know that the Distance of Route "+(routeIdx+1)+" is "+r.distance+distanceUnit;
            html+= " and the time taken to reach the end is "+r.time+timeUnit;
            html+= ".<br><p>What is the speed of Route "+(routeIdx+1)+" in "+speedUnit+" rounded to 2 decimal places?";
            answer = r.speed;
            units = speedUnit;
        }
        
        if( r.toCalculate === DISTANCE ){
            html+= "<div class='solveScreenTitle'>Calculate The Distance of Route "+(routeIdx+1)+".</div>";
            html+= "<div class='solveScreenExplain'>We know that the Speed of Route "+(routeIdx+1)+" is "+r.speed+speedUnit;
            html+= " and the Time taken to reach the end is "+r.time+timeUnit;
            html+= ".<br><p>What is the Distance of Route "+(routeIdx+1)+" in "+distanceUnit+" rounded to 2 decimal places?";
            answer = r.distance;
            units = distanceUnit;
        }
        
        if( r.toCalculate === TIME ){
            html+= "<div class='solveScreenTitle'>Calculate The Time it takes to pass Route "+(routeIdx+1)+".</div>";
            html+= "<div class='solveScreenExplain'>We know that the Speed of Route "+(routeIdx+1)+" is "+r.speed+speedUnit;
            html+= " and the Distance of Route"+(routeIdx+1)+" is "+r.distance;
            html+= ".<br><p>What is the Time taken to travel Route "+(routeIdx+1)+" in "+timeUnit+" rounded to 2 decimal places?";
            answer = r.time;
            units = timeUnit;
        }
        
        if( !r.solved ){
            html+=" <input id='answerInput' type='text' name='answerInput'></input>"+units;
            html+=" <input id='answerButton' type='submit' value='OK' onclick='main.game.submitAnswer("+routeIdx+", $(answerInput).val())'></input></p></div>";
        }else{
            html+="</p></div><div class='solveScreenExplain' style='color: rgb(0, 200, 0);'> Answer: "+answer+"</div>";
        }
        
        
        $("#answer_interface").html(html);
        
        if( r.solved ){
            $("#answerInput").val(answer);
        }
        
        $("#answerInput").focus();
        
        $("#answerInput").on( "keypress", function(event){
            console.log(event.keyCode);
            if( event.keyCode === 13 ){
                submitAnswer( routeIdx, $(answerInput).val() );
            }
            
            // If keycode is numerical (48 : 57) or if keycode is decimal point (46) return true; else return false
            return( event.keyCode >= 48 && event.keyCode <= 57 || event.keyCode === 46 );
        });
    }
    
    function submitAnswer( routeIdx, answer ){
        var r = routeConnections[routeIdx];
        answer = parseFloat(answer).toFixed(2);
        console.log( "Answer Given: "+answer+"; Speed: "+r.speed+ "; Distance: "+r.distance+"; Time: "+r.time);
        if( r.toCalculate === SPEED ){
            if( answer == r.speed ){
                r.solved = true;
                r.color = "#009900";
            }
        }
        
        if( r.toCalculate === DISTANCE ){
            if( answer == r.distance ){
                r.solved = true;
                r.color = "#009900";
            }
        }
        
        if( r.toCalculate === TIME ){
            if( answer == r.time ){
                r.solved = true;
                r.color = "#009900";
            }
        }
        
        
        if( r.solved ){
            
            var SetGreen = true;
            r.pos1.connectionLines.forEach( function( con ){
                if( !con.solved ){
                    SetGreen = false;
                }
            });
            if( SetGreen ){
                r.pos1.outerColour = "#00BB00";
            }
            
            SetGreen = true;
            r.pos2.connectionLines.forEach( function( con ){
                if( !con.solved ){
                    SetGreen = false;
                }
            });
            if( SetGreen ){
                r.pos2.outerColour = "#009900";
            }
            //alert("Correct!");
            main.game.assessment.IncrementScore();
            scoreText.text = "Score: "+main.game.assessment.GetScore();
            streakText.text = "Streak: x"+main.game.assessment.GetStreak();
            
            var foundUnsolved = false;
            routeConnections.forEach( function( e ){
                if( !e.solved )
                    foundUnsolved = true;
            });
            
            if( !foundUnsolved ){
                FinishLevel();
                return;
            }
            
            text.push( new Text("Correct!", 300, 300, "60px fantasy", "#009900", 1) );
            
            if( routeIdx+1 < routeConnections.length ){
                console.log("Starting Solve");
                StartRouteSolve( routeIdx+1 );
                return;
            }
            
            $("#answer_interface").html("");
            return;
        }
        
        text.push( new Text("Wrong!", 350, 300, "60px fantasy", "#990000", 1) );
        main.game.assessment.ResetStreak();
        main.game.assessment.IncrementMistakes();
        
        switch( main.game.assessment.GetMistakes() ){
            case 3:
                main.game.help.ShowHelp(1, 5000);
                break;
            case 6:
                main.game.help.ShowHelp(2, 5000);
                break;
        }
        streakText.text = "Streak: x"+main.game.assessment.GetStreak();
    }
    
    function DrawLine( ctx, line, color ){
        if( !color || color === "" ) color = "#000099";
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = "6px";
        ctx.moveTo( line.pointFrom.x, line.pointFrom.y );
        ctx.lineTo( line.pointTo.x, line.pointTo.y );
        ctx.stroke();
        ctx.closePath();
    }
    
    function DrawCircle( ctx, pos, radius, color ){
        if( color === "" ) color = "#000000";
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc( pos.x, pos.y, radius, 0, 2*Math.PI );
        ctx.fill();
        ctx.closePath();
    }
    
    
    function StartGame( level ){
    
        if( level !== undefined ){
            currentLevel = level;
            LoadLevel(level);
            //LoadLevel will recall StartGame, so return
            return;
        }
        
        
        if( !controlDefaultHTML) controlDefaultHTML = $('.game-control').html();
        
        $('.game-control').html( controlDefaultHTML );
        console.log("Control HTML: "+controlDefaultHTML);
        gameVariables = main.game.gameVariables;
        gameRunning = true;
        CalculatePoints();
        GeneratePointConnections();
        SetDirty();
        CleanupPoints();
        
        StartRouteSolve(0);
        
        //routePoints[0].pos.x = 0;
        /*var p = routePoint;
        p.pos.x = 10;
        p.pos.y = 10;
        
        routePoints.push(p);*/
        
    }
    
    function CalculatePoints(){
        routePoints = new Array();
        errorLines = new Array();
        moveToLines = new Array();
        
        var tempP = startRoutePoint;
        startRoutePoint = new routePoint();
        startRoutePoint.pos = tempP.pos;
        tempP = finishRoutePoint;
        finishRoutePoint = new routePoint();
        finishRoutePoint.pos = tempP.pos;
        
        var maxAttempts = 100;
        var curAttempts = 0;
        var successful = true;
        
        var moved = false;
        
        tempP = new routePoint();
        
        routePoints.push(startRoutePoint);
        
        
        var widthSpawn = finishRoutePoint.pos.x - startRoutePoint.pos.x;
        var heightSpawn = startRoutePoint.pos.y - finishRoutePoint.pos.y;
        var paddingLeft = startRoutePoint.pos.x;
        var paddingTop = finishRoutePoint.pos.y;
        
        for( var i = 1; i < maxRoutePoints; i++ ){
            //console.log("Making Point");
            var p = new routePoint();
            p.pos.x = Math.floor(Math.random() * (widthSpawn - (p.radius*2)) + p.radius + paddingLeft);
            p.pos.y = Math.floor(Math.random() * (heightSpawn - (p.radius*2)) + p.radius + paddingTop);
            
            moved = false;
            
            // Keep moving the point until it is out of range
            for( var s = 0; s < i; s++ ){
                
                if( routePoints[s].outerColour === "#FF0000" )break;
                //console.log("Distance between "+i+" and "+s+" is "+e.DistanceBetween(p.pos, routePoints[s].pos)+"px");
                /*if( e.DistanceBetween( p.pos, routePoints[s].pos ) < minDistanceBetweenRoutePoints ){
                    //console.log("Trying to correct this");
                }*/
                while( e.DistanceBetween( p.pos, routePoints[s].pos ) < minDistanceBetweenRoutePoints && i !== s ){
                    if( curAttempts > maxAttempts ) 
                        break;
                    // Paint debug points
                    if( debugTools.debugRouteSpawns ){
                        var line = new e.Line(p.pos, routePoints[s].pos);
                            errorLines.push( line );
                            p.strokeColour = "#00FF00";
                            p.outerColour = "#FF0000";
                            
                            // Create new route point to move
                            
                            routePoints.push(p);
                            moved = true;
                            curAttempts++;
                    }
                    
                    p = new routePoint();
                    p.pos.x = Math.floor(Math.random() * (widthSpawn - (p.radius*2)) + p.radius + paddingLeft);
                    p.pos.y = Math.floor(Math.random() * (heightSpawn - (p.radius*2)) + p.radius + paddingTop);
                }
                
                if( e.DistanceBetween( p.pos, routePoints[s].pos ) < minDistanceBetweenRoutePoints ){
                    successful = false;
                    continue;
                }
            }
            
            if( successful ){
                routePoints.push(p);
            }
            
            
            
            
            /*if( debugTools.routePointSpawn ){
                for( var s = 0; s < i; s++ ){
                    while( e.DistanceBetween( p.pos, routePoints[s].pos ) < minDistanceBetweenRoutePoints ){
                        if( p.outerColour !== "FF0000" ){
                            var line = new Line(p.pos, routePoints[s].pos);
                            errorLines.push( line );
                            p.strokeColour = "#00FF00";
                            p.outerColour = "#FF0000";
                            
                            // Create new route point to move
                            
                            routePoints.push(p);
                            moved = true;
                            curAttempts++;
                        }
                    }
                    
                    if(moved){
                        var l = new Line( routePoints[i].pos, routePoints[routePoints.length-1].pos );
                        moveToLines.push(l);
                        maxRoutePoints += routePoints.length-1 - i;
                        i = routePoints.length-1;
                    }
                }
            }*/
        }
        
        routePoints.push(finishRoutePoint);
        
        console.log(routePoints);
    }
    
    function CleanupPoints(){
        for( var i = 1; i < routePoints.length; i++ ){
            if( routePoints[i].connectedPoints.length === 0 ){
                routePoints.splice( i, 1 );
            }
                
        }
    }
    
    function GeneratePointConnections(){
        // Store starting and finishing nodes
        
        // Loop through every point but start and finish
        
        routeConnections = new Array();
        
        for( var p in routePoints ){
            p.connectedPoints = [];
        }
        var startPoint = routePoints[0];
        CalculateConnection( startPoint );
        //CalculateConnection( startPoint );
        //CalculateConnection( startPoint );
        
        CleanupPoints();
        
        console.log("Connected Points: ");
        console.log(routeConnections);
    }
    
    function CalculateConnection( point ){
        var endPoint = routePoints[routePoints.length-1];
        console.log( point );
        if( point === endPoint ){
            return;
        }
        
        var d = e.DistanceBetween;
        
        var padd = null; // Point to add
        
        console.log( "Distance from Point to EndPoint = "+d(point.pos, endPoint.pos));
        // Sort by distance to inputted point
        for( var i = 0; i < routePoints.length; i++ ){
            var cont = true;
            if( routePoints[i] === point ){
                console.log("Point trying to connect to itself! Aborting! index: "+i);
                cont = false;
                continue;
            }
            
            if( point.isConnectedTo( routePoints[i] ) && cont ){
                console.log("Point already connected! Aborting! index: "+i);
                cont = false;
                continue;
            }
            
            if( !padd && cont ){
                if( CanConnectToEnd( routePoints[i], new Array() ) ){
                    padd = routePoints[i];
                    console.log("Setting Padd to index: " +i);
                }
                cont = false;
                continue;
            }
            
            //console.log( "Distance from Test Point to EndPoint = "+d(routePoints[i].pos, endPoint.pos));
            
            //console.log( "Distance between padd and point is: "+d(point.pos, padd.pos));
            //console.log( "Distance between test point and point is: "+d( routePoints[i].pos, point.pos ));
            if( routePoints[i] !== point && cont &&
                    // If the testing connection is closer to the point we're trying to connect
                    d( routePoints[i].pos, point.pos ) < d(padd.pos, point.pos) &&
                    // And the testing connection is closer to the finish
                    d( routePoints[i].pos, endPoint.pos ) < d(point.pos, endPoint.pos)&&
                    routePoints[i].connectedPoints <= padd.connectedPoints &&
                    !ConnectionCollision( point.pos, routePoints[i].pos ) ){
                
                //if( CanConnectToEnd( routePoints[i], null ) ){
                    padd = routePoints[i];
                    console.log("Successfully set padd to index: "+i);
                //}else{
                   // console.log("FAILED TO PASS CanConnectToEnd. Index: "+i);
               // }
            }
        }
        
        if( !padd  )return;

        if( point.isConnectedTo( padd ) ){
            console.log("Point already connected, aborting!");
            //console.log( routeConnections );
            return;
        }
        
        console.log("Connection Successful!");
        
        if( padd === endPoint ){
            console.log("End Point connected!");
        }
        point.ConnectTo( padd );
        
        CalculateConnection( padd );
    } // End CalculateConnection
    
    function ConnectionCollision( from, to ){
        // TODO: FIX THIS!
        return false; // Return false because it's broken
        var Line1 = new e.Line;
        Line1.pointFrom = from;
        Line1.pointTo = to;
        for( var i = 0; i < routeConnections.length; i++ ){
            var r = routeConnections[i];
            var Line2 = new e.Line();
            Line2.pointFrom = r.pos1.pos;
            Line2.pointTo = r.pos2.pos;
            if( e.LineTest( Line1, Line2 ) ){
                return true;
            }
        }
        return false;
    }
    
    function CanConnectToEnd( point, checkedPoints ){
        if( !checkedPoints )checkedPoints = new Array();
        var checkedCons = new Array();
        //console.log("checkedCons Length = "+checkedCons.length);
        
        for( var x = 0; x < checkedPoints.length; x++ ){
                if( point === checkedPoints[x] ){
                    //console.log("Already tested point, aborting!");
                    return false;
                }
        }
        
        var ind = 0;
        
        
        var endPoint = routePoints[routePoints.length-1];
        
        var d = e.DistanceBetween;
        var padd = null; // Point to add
        // Sort by distance to inputted point
        for( var i = 0; i < routePoints.length; i++ ){
            var cont = true;
            if( routePoints[i] === point ){
                cont = false;
                continue;
            }
            
            for( var x = 0; x < checkedCons.length; x++ ){
                if( routePoints[i] === checkedCons[x] ){
                    //console.log("Already tested, aborting loop!");
                    cont = false;
                    continue;
                }
            }
            
            if( point.isConnectedTo( routePoints[i] ) && cont ){
                cont = false;
                continue;
            }
            
            if( !padd && cont && routePoints[i] !== point && cont &&
                       !point.isConnectedTo(routePoint[i]) &&
                       !routePoints[i].isConnectedTo(endPoint) ){
                padd = routePoints[i];
                ind = i;
                cont = false;
                continue;
            }else{
                checkedCons.push( routePoints[i] );
            }
            if( routePoints[i] !== point && cont &&
                    // If the testing connection is closer to the point we're trying to connect
                    d( routePoints[i].pos, point.pos ) < d(padd.pos, point.pos) &&
                    // And the testing connection is closer to the finish
                    d( routePoints[i].pos, endPoint.pos ) < d(point.pos, endPoint.pos)&&
                           !point.isConnectedTo(routePoint[i]) &&
                           !routePoints[i].isConnectedTo(endPoint) ){
                    padd = routePoints[i];
            }else{
                checkedCons.push( routePoints[i] );
            }
        }
        
        if( !padd )return false;

        if( point.isConnectedTo( padd ) ){
            //console.log("Point already connected, aborting!");
            //console.log( routeConnections );
            return false;
        }
        
        if( point.isConnectedTo( endPoint ) ){
            //console.log("Connected To End Point, aborting");
            return false;
        }
        
        if( point === endPoint ){
            //console.log("Can Connect To EndPoint!");
            return true;
        }
        
        checkedPoints.push( point );
        return CanConnectToEnd( padd, checkedPoints );
        
    }
    
    
    function ResumeGame(){
        gameRunning = true;
    }
    
    function PauseGame(){
        gameRunning = false;
    }
    
    return{
        gameRunning : gameRunning,
        StartGame : StartGame,
        ResumeGame : ResumeGame,
        PauseGame : PauseGame,
        Update : Update,
        SetDirty : SetDirty,
        submitAnswer : submitAnswer
    };
})();

////////////////////////////////////////////////////////////////////////////////
///////////////////////// Game Specific classes ////////////////////////////////
////////////////////////////////////////////////////////////////////////////////


/*main.game.gameVariables = (function(){
    var point = main.game.routePoint;
    return{
        point : point
    };
})();

main.game.routePoint = (function(){
    var pos = main.engine.Vector2;
    var connectedPoints = [];
    return{
        pos : pos,
        connectedPoints : connectedPoints
    };
})();*/

/* ////////////////////////
 * ////////////////////////
 * //   Code for Kevin   //
 * ////////////////////////
 * ////////////////////////

var users = new Array();

var User = function(name){
    var scores = new Array();
    
    function GetScoresForLevel( level ){
        var tempScore = new Array();
        for( var i = 0; i < scores.length; i++ ){
            if( scores[i].level === level ){
                tempScores.push(scores[i]);
            }
        }
        return tempScore;
    }
    
    return{
        name : name,
        scores : scores
    };
};

var Score = function( levelname, score ){
    return{
        levelname : levelname,
        score : score
    };
};

function AddScore( user, level, score ){
    var s = new Score( level, score );
    var u = GetUser( user );
    if( !u )
        u = new User( user );
    
    u.scores.push( s );
    
}

function GetUser( name ){
    for( var i = 0; i < users.length; i++ ){
        if( users[i].name === name ){
            return users[i];
        }
    }
}*/
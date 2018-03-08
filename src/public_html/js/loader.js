/* 
 * This file handles the resource loading, including the base game
 * This file is no longer used, all code is raw-coded into index.html
 */

var main = {};

window.addEventListener("load", function(){
    
    Modernizr.load([
        {
            load: [
                "js/libs/jquery-sizzle/sizzle.js",
                "js/game/dom.js",
                "js/game/sg_engine.js",
                "js/game/resources.js",
                "js/game/game3d.js",
                "js/game/main.js"
            ],
            complete: function(){
                console.log("All files loaded!");
                main.game.showScreen("splash-screen");
            }
        }  
    ]);
    
}, false);
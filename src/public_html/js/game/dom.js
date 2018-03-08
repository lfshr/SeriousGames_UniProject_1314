
main.dom = (function() {
    
    function hasClass(el, classname){
        var regex = new RegExp("(^|\\s" + classname + "\\s|$)");
        // I have no idea where the undefined is coming from
        // but I included this line as a quick fix
        if( regex.test("undefined") ) return false;
        return regex.test(el.className);
    }
    
    function addClass(el, classname){
        if( !hasClass(el, classname) ){
            el.className += " " + classname;
        }
    }
    
    function removeClass(el, classname){
        /*console.log("removing class \'"+classname+"\' from "+el);
        console.log("old classname: " + el.className);
        var regex = new RegExp("(^|\\s" + "classname" + "\\s|$)");
        console.log("HasClass: "+regex.test(el.className));*/
        
        el.className = el.className.replace(classname, " ");
        
        //console.log("new classname:" + el.className);
    }
    
    return{
      $ : $,
      hasClass : hasClass,
      addClass : addClass,
      removeClass : removeClass
    };
})();
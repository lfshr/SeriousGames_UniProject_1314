

main.game.assessment = (function(){
    
    var user = {
        name : "",
        score : 0,
        streak : 0,
        mistakes : 0
    };
    
    var scoreIncrement = 100;
    
    function GetUser(){
        if( user )
            console.log("No user!");
        
        return user;
    }
    
    function GetName(){
        return user.name;
    }
    
    function SetUser( name ){
        user.name = name;
    }
    
    function IncrementScore( score ){
        if( score === undefined ){
            score = scoreIncrement;
        }
        console.log("Score parsed: "+score);
        user.streak++;
        user.score+= score * user.streak;
    }
    
    function ResetScore(){
        user.score = 0;
    }
    
    function GetScore(){
        return user.score;
    }
    
    function ResetStreak(){
        user.streak = 0;
    }
    
    function GetStreak(){
        return user.streak;
    }
    
    function GetMistakes(){
        return user.mistakes;
    }
    
    function IncrementMistakes( increment ){
        if( increment === undefined ) increment = 1;
        user.mistakes += increment;
    }
    
    function ResetMistakes(){
        user.mistakes = 0;
    }
    
    function ResetAll(){
        ResetStreak();
        ResetScore();
        ResetMistakes();
    }
    
    return{
        GetUser : GetUser,
        SetUser : SetUser,
        GetName : GetName,
        IncrementScore : IncrementScore,
        ResetStreak : ResetStreak,
        GetScore : GetScore,
        GetStreak : GetStreak,
        ResetAll : ResetAll,
        GetMistakes : GetMistakes,
        IncrementMistakes : IncrementMistakes,
        ResetMistakes : ResetMistakes
    };
})();
$(document).ready(function(){
    app.c.init();
});

///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

var app={};
app.m={};
app.v={};
app.c={};
app.t={};

///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

app.m.periodicFetch=false;
app.m.pauseButton=false;
app.m.mostRecentCreation=0;
app.m.currentTweetleIndex=false; 
app.m.tweetles=[];
app.m.tweetleSource=streams.home;
app.m.canvas=false;
app.m.resizeLock=false;
app.m.appName="Twittler";

///////////////////////////////////////////////////////
///////////////////////////////////////////////////////begin controllers

app.c.init=function(){
  app.v.init();  
  app.v.listeners();
};

///////////////////////////////////////////////////////end controllers
///////////////////////////////////////////////////////begin views

app.v.init=function(){
    if (app.m.periodicFetch){
      clearInterval(app.m.periodicFetch);
      app.m.periodicFetch=false;
    }
    $("body").html(app.t.layout() );
    app.m.bounds=app.v.initBounds();
    var b=app.m.bounds;
    
    zi.css();
    app.m.canvas=app.v.initCanvas();
    app.v.pauseButton();
    
    app.v.solarSystem();
    app.v.initialReveal();
};

app.v.initialReveal=function(){
    var b=app.m.bounds;
    app.m.canvas.rect(b.left,b.top,b.width+100,b.height)
      .attr({"fill":"#000"})
      .animate({opacity:0},5000,"<>",function(){this.remove();})
      .toFront();
    app.m.canvas.text(app.m.bounds.centerX,app.m.bounds.centerY,"TWITTLER")
      .attr({"font-size":Math.floor(b.width/7),"fill":"#fff"})
      .animate({opacity:0},3000,"<>",function(){
        $("body").trigger("toggleFetch");
        this.remove();
      }).toFront();
};

app.v.initCanvas=function(){
  var b=app.m.bounds;
  $("#canvas").css({
      height:b.height+"px",
      padding:0,
      margin:0,
      border:0
  });
  var c=new Raphael('canvas');  
  return c;
};


app.v.initBounds=function(){
	var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight|| e.clientHeight|| g.clientHeight;
  var b={};
  b.right=x-20;
  b.left=0;
  b.top=0;
  b.bottom=y;
  b.centerX=b.right/2;
  b.centerY=b.bottom/2;
  b.width=b.right-b.left;
  b.height=b.bottom-b.top;

  return b;
};

app.v.solarSystem=function(){
  var b=app.m.bounds;
  var c=app.m.canvas;
  var centerPoint={x:b.right-30,y:b.centerY};
  var orbits=_.random(5,10);
  var orbitalRadius=100;
  while (orbitalRadius<Math.max(b.height,b.width) ){
    var bodies=_.random(2,30);
    orbitalRadius+=_.random(50,300);
      var rotation=360;
      if (Math.random()>0.5){rotation*=-1;}
      var rotationSpeed=100000*_.random(1,10);
      c.circle(centerPoint.x,centerPoint.y,orbitalRadius);
    for (var j=0;j<bodies;j++){
      var theta=j*(360/(bodies+1) );
      var derivedPoint=geo.getPoint(centerPoint.x,centerPoint.y,orbitalRadius,theta);
      var r=_.random(5,20);
      var anim= Raphael.animation({transform:"r "+rotation+", "+centerPoint.x+", "+centerPoint.y+""},rotationSpeed);
      c.circle(derivedPoint.x2,derivedPoint.y2,r)
        .attr({fill:"#555"})
        .animate(anim.repeat(Infinity) );
    }
  }
};

app.v.pauseButton=function(){
  var c=app.m.canvas;
  var b=app.m.bounds;
  var r=20;
  var x=b.right-(1.5*r);
  var y=b.centerY;
  var pauseButton=c.circle(x,y,r).attr({
    fill:"yellow",
    cursor:"pointer"
  }).click(function(){
    $("body").trigger("toggleFetch");
    if (app.m.periodicFetch){
      this.stop();
      this.animate({"fill":"yellow"},600,"<>");
      this.data("label").attr({text:"pause"});
    }else{
      this.stop();
      this.animate({"fill":"red"},600,"<>");
      this.data("label").attr({text:"paused"});
    }
    var x=this.attr("cx");
    var y=this.attr("cy");
    var r=this.attr("r");
    c.circle(x,y,0)
    .attr({'stroke-width':1,stroke:"#000",r:r})
    .animate({r:100,opacity:0},1000,function(){
      this.remove();
    });
  });
  
  
  
  var label=c.text(pauseButton.attr("cx")-25,pauseButton.attr("cy"),"pause")
    .attr({"opacity":0,'text-anchor':'end'});
    
  pauseButton.data("label",label);
  
  pauseButton.hover(function(){
    this.stop();
    this.data("label").animate({opacity:1},300);
  },function(){
    this.stop();
    this.data("label").animate({opacity:0},300);
  });
  
  app.m.pauseButton=pauseButton;
};



app.v.displayTweetle=function(tweetle,index,target){
    var target=target || "#tweetles";
    
    $(target).prepend(app.t.tweetle(tweetle,index));
    $("div.tweetle").slideDown();
};

app.v.listeners=function(){
    
  $("body").on("fetchTweetles",function(){
    if (app.m.mostRecentCreation<streams.home.length-1){
      app.m.mostRecentCreation++;
      app.m.currentTweetleIndex++;
      app.v.displayTweetle(streams.home[app.m.mostRecentCreation],app.m.mostRecentCreation);
    }
  });
    
  $("body").on("toggleFetch",function(){
    if (app.m.periodicFetch){
      $("body").trigger("fetchTweetlesOff");
    }else{
      $("body").trigger("fetchTweetlesOn");
    }
    
    
  }); 
  
  
  $("body").on("fetchTweetlesOff",function(){
      clearInterval(app.m.periodicFetch);
      app.m.periodicFetch=false;
      
      
      app.m.pauseButton.stop();
      app.m.pauseButton.animate({"fill":"red"},600,"<>");
      app.m.pauseButton.data("label").attr({text:"paused"});
      
      
  });  
  
  
  $("body").on("fetchTweetlesOn",function(){
      $("body").trigger("fetchTweetles");
      
      
      app.m.pauseButton.stop();
      app.m.pauseButton.animate({"fill":"yellow"},300,"<>");
      app.m.pauseButton.data("label").attr({text:"pause"});
      
      
      app.m.periodicFetch=setInterval(function(){
        $("body").trigger("fetchTweetles");
        },3000);
  });  
  
  $("body").on("displayFromUser",function(){
    $("body").trigger("fetchTweetlesOff");
    $("div#tweetles").html(app.t.userTweetles(app.m.selectedUser) );
    $("div.tweetle").fadeIn();
    $("div#tweetles h1").fadeIn();
  });
    
  $(window).resize(function(){
    if (app.m.resizeLock===false){
      app.m.resizeLock=true;
        setTimeout(function(){
          $("body").html(" ");
          app.m.canvas.clear();
          app.m.tweetles=[];
          app.v.init();
          app.m.resizeLock=false;
        },200);
      
    }
  });  
  
  $("body").on("click","div#tweetles div.user",function(){
    app.m.selectedUser=$(this).text().slice(1);
    $("body").trigger("displayFromUser");
  });
  
  //keydowns
  
  $("body").keydown(function(){
    var key=event.which;
    //console.log(key);
    if (key!==13 && key!==16 && key!==17 && key!==18 && key!==8 && key!==9){
      $("div#pseudomodal").fadeIn(function(){
        $("div#pseudomodal input[type=text]").focus();
      });
    }
    if (key===13 || (key===8 && $("div#pseudomodal input[type=text]").val()==="" ) ){
      var tweetle={};
      tweetle.user="you";
      tweetle.created_at=new Date();
      tweetle.message=$("div#pseudomodal input[type=text]").val();
      if (tweetle.message){
        app.v.displayTweetle(tweetle);
      }
      if (!streams.users[tweetle.user]){
        streams.users[tweetle.user]=[];
      }
      
      if ($("div#pseudomodal input[type=text]").val()!==""){
        streams.users[tweetle.user].push(tweetle);
      }
      $("div#pseudomodal input[type=text]").val("");
      $("div#pseudomodal").fadeOut(); 
      
    }
  });
  
    
};

///////////////////////////////////////////////////////end views
///////////////////////////////////////////////////////begin templates

app.t.layout=function(){
  var d="";
  d+="<div id='tweetles'></div>";
  d+="<div id='canvas'></div>";
  d+="<div id='pseudomodal'><input type='text'></input></div>";
  return d;
};

app.t.tweetle=function(tweetle,index){
      var index = index || -1;
      var d="";
      d+="<div id='"+index+"' class='tweetle'>";
        d+="<div class='created_at'>"+tweetle.created_at+"</div>";
        d+="<div class='message'>"+tweetle.message+"</div>";
        d+="<div class='user'>@"+tweetle.user+"</div>";
      d+="</div>";
      
      return d;
};

app.t.userTweetles=function(user){
  var d="";
  d+="<h1>@"+user+"</h1>";
  for (var i=streams.users[user].length-1;i>-1;i--){
    d+=app.t.tweetle(streams.users[user][i],i);
  }
  return d;
};

///////////////////////////////////////////////////////end templates
///////////////////////////////////////////////////////begin css

zi={};
zi.config=function(){
    var css={
      "body":{
        "padding":"0",
        "margin":"0",
        "border":"0"
      },
      "div#canvas":{
        "z-index":"-1",
        "position":"fixed",
        "top":"0px",
        "left":"0px",
        "width":"100%",
        "padding":"0",
        "margin":"0",
        "border":"0"
      },
      "div#tweetles":{
        "position":"absolute",
        "top":"0px",
        "left":"0px",
        "margin-right":"75px"
      },
      "div.tweetle":{
        "display":"none",
        "margin":"30px",
        "margin-right":"0px",
        "background":"#333",
        "font-family":"sans-serif",
        "color":"#fff",
        "padding":"10px",
        "border":"1px solid #333",
        "opacity": 0.8,
        "filter": "alpha(opacity=80)" /* For IE8 and earlier */
      },
      "div.tweetle div.created_at":{
        "text-align":"right",
        "font-size":"0.7em",
        "border-bottom":"1px solid #333"
      },
      "div.tweetle div.user":{
        "text-align":"right",
        "border-top":"1px solid #333",
        "cursor":"pointer"
      },
      "div.tweetle div.message":{
        "font-size":""+Math.max(1.5,(app.m.bounds.right/600))+"em"
      },
      "div#pseudomodal":{
        "display":"none",
        "position":"fixed",
        "width":app.m.bounds.right-120+"px",
        "top":Math.floor(app.m.bounds.bottom/3)+"px",
        "left":"0px",
        "padding":"0",
        "z-index":2,
        "opacity":0.9,
        "filter":"alpha(opacity=90)",
        "margin":"60px"
      },
      "div#pseudomodal input[type=text]":{
        "width":"100%",
        "border":"1px solid #000",
        "padding":"20px 0 20px 0",
        "font-size":""+Math.max(1.5,(app.m.bounds.right/400))+"em",
        "text-align":"center",
        "background":"#000",
        "color":"#fff"
      },
      "div#tweetles h1":{
        "display":"none"
      }
    };
    return css;
};
zi.transform=function(css){
    var c="";
    for (var selector in css){
        c+=selector+"{";
        for (var property in css[selector]){
            c+=property+" : "+css[selector][property]+";";
        }
        c+="}";
    }
    return c;
};
zi.css=function(){
    if ($("head#zi").length<1){
        $("head").append("<style type='text/css' id='zi'></style>");
    }
    $("head style#zi").html( this.transform( this.config() ) );
};
/////////////////////////////////////////////////////// end css section
///////////////////////////////////////////////////////



///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
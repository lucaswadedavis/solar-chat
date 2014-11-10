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
app.m.mostRecentCreation=0;
app.m.currentTweetleIndex=false; 
app.m.tweetles=[];
app.m.canvas=false;
app.m.resizeLock=false;
app.m.appName="Twittler";

///////////////////////////////////////////////////////
///////////////////////////////////////////////////////begin controllers

app.c.init=function(){
  app.v.init();  
  app.v.listeners();
  //app.c.heartBeat();
};


app.c.heartBeat=function(){
  if (app.m.mostRecentCreation!==streams.home[streams.home.length-1]['created_at']){
      app.m.mostRecentCreation=streams.home[streams.home.length-1]['created_at'];
  }
  app.v.displayLatest();
  setTimeout(function(){
      app.c.heartBeat();
  },3000);  
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
      .animate({opacity:0},1500,"<>",function(){
        $("body").trigger("fetchTweetles");
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
    orbitalRadius+=_.random(50,200);
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
        .attr({fill:"#333"})
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
    }else{
      this.stop();
      this.animate({"fill":"red"},600,"<>");
    }
    var x=this.attr("cx");
    var y=this.attr("cy");
    var r=this.attr("r");
    c.circle(x,y,0)
    .attr({'stroke-width':1,stroke:"#000",r:r})
    .animate({r:100,opacity:0},1000,function(){
      this.remove();
    })
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
};

app.v.displayTweetle=function(tweetle,index,target){
    var target=target || "#tweetles";
    
    $(target).prepend(app.t.tweetle(tweetle,index));
    $("div.tweetle").slideDown();
};

app.v.svgDisplayTweetle=function(tweetle,tweetles,canvas,bounds){
    var c=canvas || app.m.canvas;
    var b=bounds || app.m.bounds;
    var t=tweetles || app.m.tweetles;
    var s=streams;

    var Tweetle=function(t){
      var x=0;
      var y=-50;
      var message=c.text(x,y,t.message);
        message.attr({
            "opacity":0,
            "fill":"#fff",
            "font-size":Math.floor(b.width/40),
            "text-anchor":"start"
        });
        var bBox=message.getBBox();
        var created_at=c.text(x,y,t.created_at)
          .attr({opacity:0,"text-anchor":"start"});
        var user=c.text(b.right,b.centerY,"@"+t.user)
          .attr({opacity:0,"text-anchor":"start",cursor:"pointer"});
        
        var background=c.rect(bBox.x,bBox.y,0,bBox.height)
          .attr({"stroke-width":0,"fill":"#000","opacity":0.85})
          .toBack();
        message.data("background",background);
        message.data("user",user);
        message.data("created_at",created_at);
        
        return message;
    };
    
    var positionTweetles=function(tweetles){
      var t=tweetles || app.m.tweetles;
      
      var tInterval=600;
      var easing="<>";
      var yInterval=b.height/(t.length+1);
      for (var i=0;i<t.length;i++){
        var x=0;
        var y=yInterval*(i+1);
        t[i].animate({x:x,y:y},tInterval,easing);
        t[i]['data']("background").animate({x:x,y:y-Math.floor(b.width/80)},tInterval,easing);
        t[i]['data']("created_at").animate({
          x:x,
          y:y-Math.floor(b.width/60)-2
        },tInterval,easing);
        t[i]['data']("user").animate({
          x:t[i].getBBox().x2+30,
          y:y
        },tInterval,easing);
      }
      
    };
    
    var revealTweetle=function(t){
      var buffer=20;
      var bbox=t[0].getBBox();
      var r=t[0].data("background");
      var created_at=t[0].data("created_at");
      created_at.attr({x:bbox.x,y:bbox.y+5});
      created_at.toBack();
      r.animate({width:bbox.width+buffer,x:bbox.x},300,"<>",function(){
        t[0].animate({opacity:1},100);
        created_at.animate({opacity:1,y:bbox.y-2},100);
        t[0].data("user").animate({opacity:1},300);
      });
    };
    
    var removeTweetle=function(t){
      var max=8;
      if (t.length>8){
        t[t.length-1]['data']("background")
        .animate({width:0},300,"<>",function(){
          this.remove();
        });
        t[t.length-1]['data']("created_at")
        .animate({opacity:0},300,"<>",function(){
          this.remove();
        });
        t[t.length-1]['data']("user")
        .animate({opacity:0},300,"<>",function(){
          this.remove();
        });
        t[t.length-1]
        .animate({opacity:0},100,"<>",function(){
          this.remove();
        });
        t.splice(8,1);
      }
    };
    
    var newestTweetle=Tweetle(tweetle);
    t.reverse();
    t.push(newestTweetle);
    t.reverse();
    
    _.delay(removeTweetle,600,t);
    positionTweetles();
    _.delay(revealTweetle,600,t );
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
      clearInterval(app.m.periodicFetch);
      app.m.periodicFetch=false;
    }else{
      app.m.periodicFetch=setInterval(function(){
        $("body").trigger("fetchTweetles");
        },3000);
    }
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
  
  //keydowns
  /*
  $("body").keydown(function(){
    if (event.which===38){
     $("body").trigger("fetchTweetles"); 
    }
  });
  */  
    
};

///////////////////////////////////////////////////////end views
///////////////////////////////////////////////////////begin templates

app.t.layout=function(){
  var d="";
  d+="<div id='tweetles'></div>";
  d+="<div id='canvas'></div>";
  return d;
};

app.t.tweetle=function(tweetle,index){
      var d="";
      d+="<div id='"+index+"' class='tweetle'>";
        d+="<div class='created_at'>"+tweetle.created_at+"</div>";
        d+="<div class='message'>"+tweetle.message+"</div>";
        d+="<div class='user'>@"+tweetle.user+"</div>";
      d+="</div>";
      
      return d;
};

app.t.stream=function(){
  var d="";
  for (var i=0;i<streams.home.length;i++){
      d+="<div class='twittle' id='"+i+"'>";
        d+="<span class='user'>@"+streams.home[i].user+"</span>";
        d+="<span class='twittle'>"+streams.home[i].message+"</span>";
      d+="</div>";
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
        "opacity": 0.9,
        "filter": "alpha(opacity=90)" /* For IE8 and earlier */
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
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////



///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
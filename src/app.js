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
app.m.tweetles=[];
app.m.canvas=false;
app.m.appName="Twittler";

///////////////////////////////////////////////////////
///////////////////////////////////////////////////////begin controllers

app.c.init=function(){
  app.v.init();  
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
    $("body").html(app.t.layout() );
    app.m.bounds=app.v.initBounds();
    app.m.canvas=app.v.initCanvas();
    app.v.pauseButton();
    app.v.listeners();
    $("body").trigger("toggleFetch");
};

app.v.initCanvas=function(){
  var b=app.m.bounds;
  var c=new Raphael(0,0,b.width,b.height);  
  $("#canvas").css({
      height:$(document).height(),
      padding:0,
      margin:0,
      border:0
  });
  return c;
};


app.v.initBounds=function(){
  var b={};
  b.right=$(document).width()-20;
  b.left=0;
  b.top=0;
  b.bottom=$(document).height()-20;
  b.centerX=b.right/2;
  b.centerY=b.bottom/2;
  b.width=b.right-b.left;
  b.height=b.bottom-b.top;

  return b;
};

app.v.pauseButton=function(){
  var c=app.m.canvas;
  var b=app.m.bounds;
  var r=20;
  var x=b.right-(1.5*r);
  var y=b.bottom-(1.5*r);
  c.circle(x,y,r).attr({
    fill:"#333",
    cursor:"pointer"
  }).click(function(){
    $("body").trigger("toggleFetch")
  });
  
};

app.v.displayTweetle=function(tweetle,tweetles,canvas,bounds){
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
          .attr({opacity:1,"text-anchor":"start"});
        var user=c.text(x,y,"@"+t.user)
          .attr({opacity:1,"text-anchor":"start"});
        
        var background=c.rect(bBox.x,bBox.y,0,bBox.height)
          .attr({"stroke-width":0,"fill":"#000","opacity":0.9})
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
      }
      
    };
    
    var revealTweetle=function(t){
      var buffer=20;
      var bbox=t[0].getBBox();
      var r=t[0].data("background");
      r.animate({width:bbox.width+buffer,x:bbox.x},300,"<>",function(){
        t[0].animate({opacity:1},100);
      });
    }
    
    var removeTweetle=function(t){
      var max=8
      if (t.length>8){
        t[t.length-1]['data']("background")
        .animate({width:0},300,"<",function(){
          this.remove();
        });
        t[t.length-1]
        .animate({opacity:0},100,"<",function(){
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

app.v.oldDisplayLatest=function(canvas,bounds){
    var c=canvas || app.m.canvas;
    var b=bounds || app.m.bounds;
    var s=[];
    var numberOfMessages=Math.floor(b.height/50);
    var yInterval=b.bottom/(numberOfMessages+1);
    var buffer=10;
    for (var i=streams.home.length-1;i>streams.home.length-numberOfMessages;i--){
        var y=yInterval*(1+i);
        var message=c.text(buffer,y,streams.home[i].message);
        message.attr({
            "opacity":0,
            "fill":"#fff",
            "font-size":24,
            "text-anchor":"start"
        });
        var bBox=message.getBBox();
        var created_at=c.text(buffer,y,streams.home[i].created_at)
          .attr({opacity:0,"text-anchor":"start"});
        var user=c.text(bBox.x2,y,"@"+streams.home[i].user)
          .attr({opacity:0,"text-anchor":"start"});
        
        var background=c.rect(bBox.x-buffer,bBox.y,0,bBox.height)
          .attr({"stroke-width":0,"fill":"#000","opacity":0.9})
          .toBack();
        message.data("background",background);
        message.data("user",user);
        message.data("created_at",created_at);
        
        s.push(message);
    }
    
    var tInterval=Math.floor(1000/s.length);
    for (var i=0;i<s.length;i++){
        var bBox=s[i].getBBox();
        var r=s[i].data("background");
        var created_at=s[i].data("created_at");
        var user=s[i].data("user");
        
        var userAnim=new Raphael.animation({opacity:1,y:(bBox.y2-5),x:bBox.x2+(2*buffer)},500,"<>");
        var created_atAnim=new Raphael.animation({opacity:1,y:(bBox.y2-35)},500,"<>");
        var rectAnim=new Raphael.animation({"width":bBox.width+(2*buffer)},1000,"<>");
        var anim=new Raphael.animation({"opacity":1},500);
        
        user.animate(userAnim.delay(1000+(tInterval*i)));
        created_at.animate(created_atAnim.delay(1000+(tInterval*i)));
        s[i].animate(anim.delay(1000+(tInterval*i)));
        r.animate(rectAnim.delay(tInterval*i));
    }
};

app.v.listeners=function(){
    
  $("body").on("fetchTweetles",function(){
    if (app.m.mostRecentCreation<streams.home.length-1){
      app.m.mostRecentCreation++;
      app.v.displayTweetle(streams.home[app.m.mostRecentCreation]);
    }
  });
    
  $("body").on("toggleFetch",function(){
    if (app.m.periodicFetch){
      clearInterval(app.m.periodicFetch);
      app.m.periodicFetch=false;
    }else{
      app.m.periodicFetch=setInterval(function(){
        $("body").trigger("fetchTweetles");
        },1500);
    }
  });  
    
};

///////////////////////////////////////////////////////end views
///////////////////////////////////////////////////////begin templates

app.t.layout=function(){
  var d="";
  d+="<div id='canvas'></div>";
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

$("body").css({
  "border":0,
  "padding":0,
  "margin":0,
  "width":"100%",
  "height":"100%"
});

///////////////////////////////////////////////////////
///////////////////////////////////////////////////////



///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
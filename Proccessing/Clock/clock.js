 var canvasX = 400
 var canvasY = 400

// for every 10 px change the ratio for arc and had 


//window setup
 function setup() {
   createCanvas(canvasX, canvasY);
   angleMode(DEGREES);
 }

 var insideArc = canvasX - 100
 var middleArc = canvasX - 120
 var outsideArc = canvasX - 140

 var secondHand = canvasX * .3
 var minuteHand = canvasX * .2
 var hourHand = canvasX * .15

 var canvasCenter = canvasX / 2

 //main clock
 function draw() {
   background(0);
   translate(canvasCenter, canvasCenter);
   rotate(-90);

   let hr = hour();
   let mn = minute();
   let sc = second();

   strokeWeight(8);
   stroke(255, 100, 150);
   noFill();
   //SECOND hand
   let secondAngle = map(sc, 0, 60, 0, 360);
   //clock circle
   arc(0, 0, insideArc, insideArc, 0, secondAngle);
   //MINUTE hand
   stroke(150, 100, 255);
   let minuteAngle = map(mn, 0, 60, 0, 360);
   //clock circle
   arc(0, 0, middleArc, middleArc, 0, minuteAngle);
   //HOUR hand
   stroke(150, 255, 100);
   let hourAngle = map(hr % 12, 0, 12, 0, 360);
   //clock circle
   arc(0, 0, outsideArc, outsideArc, 0, hourAngle);

   push();
   rotate(secondAngle);
   stroke(255, 100, 150);
   line(0, 0, secondHand, 0);
   pop();

   push();
   rotate(minuteAngle);
   stroke(150, 100, 255);
   line(0, 0, minuteHand, 0);
   pop();

   push();
   rotate(hourAngle);
   stroke(150, 255, 100);
   line(0, 0, hourHand, 0);
   pop();

   stroke(255);
   point(0, 0);

 }

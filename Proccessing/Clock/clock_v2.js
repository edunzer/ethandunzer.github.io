var hourColor
var minuteColor
var secondColor

function setup() {
    fullscreen();
    this.angleMode(this.DEGREES);
    this.textAlign(this.CENTER, this.CENTER);
    hourColor = color('#29E7CD');
    minuteColor = color("F4EBE8");
    secondColor = color("#3993DD");
}

function draw(argument) {
    this.background(0);
    this.noFill();
    let hour = map(this.hour() % 12, 0, 12, 0, 360);
    let minute = map(this.minute(), 0, 60, 0, 360);
    let sc = map(this.second(), 0, 60, 0, 360);

    let hourText = this.hour();
    let minuteText = this.minute();
    let secondText = this.second();

    if (parseInt(hourText)>12){
        hourText = parseInt(hourText)-12;
    }

    // let hour = 30;
    // let minute = 100;
    // let sc = 0;
    translate(width/2, height/2);
    rotate(-90);
    strokeWeight(4);
    stroke(secondColor);
    arc(0, 0, 300, 300, 0, sc);

    stroke(minuteColor);
    arc(0, 0, 285, 285, 0, minute);
    stroke(hourColor);
    arc(0, 0, 270, 270, 0, hour);


    push();
    rotate(sc);
    stroke(secondColor);
    line(0, 0, 100, 0);
    push();
    strokeWeight(1);
    translate(110, 0);
    rotate(90 - sc);
    text(secondText, 0, 0);
    pop();
    pop();

    push();
    rotate(minute);
    stroke(minuteColor);
    line(0, 0, 80, 0);

    push();
    strokeWeight(1);
    translate(93, 0);
    rotate(90 - minute);
    text(minuteText, 0, 0);
    pop();
    pop();

    push();
    rotate(hour);
    stroke(hourColor);
    line(0, 0, 60, 0);

    push();
    strokeWeight(1);
    translate(70, 0);
    rotate(90 - hour);
    text(hourText, 0, 0);
    pop();
    pop();


}


function mouseClicked() {
    hourColor = color(random(0,255),random(0,255),random(0,255));
    minuteColor = color(random(0,255),random(0,255),random(0,255));
    secondColor = color(random(0,255),random(0,255),random(0,255));
}

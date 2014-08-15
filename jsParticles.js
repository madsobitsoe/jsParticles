// Very simple particle system/physics engine
// Mads Obitsø
// www.cccamera.dk
// -----------------------------------------------------------------------------

// Setup width, height and pi
var Width = 400, Height = 400, pi=Math.PI;

// Setup canvas
var canvas = document.getElementById("game");
canvas.width = Width;
canvas.height = Height;
canvas.setAttribute('tabindex', 1);


var ctx = canvas.getContext("2d");
var FPS = 1000 / 60;
// Create gravity vector
var gravity = new Vector(1.2, pi);
// Create counter for for creating new particles
var Counter = 0;
// Create array to hold particles
var ParticleArray = [];

// Request animation frame from multiple browser engines
window.requestAnimFrame = (function(){ 
    return window.requestAnimationFrame 
	|| window.webkitRequestAnimationFrame 
	|| window.mozRequestAnimationFrame 
	|| window.oRequestAnimationFrame 
	|| window.msRequestAnimationFrame 
	|| function( callback ){ return window.setTimeout(callback, FPS); }; }
                          )();
// Cancel request of animation frame from multiple browser engines
window.cancelRequestAnimFrame = (function() { 
    return window.cancelAnimationFrame 
	|| window.webkitCancelRequestAnimationFrame 
	|| window.mozCancelRequestAnimationFrame 
	|| window.oCancelRequestAnimationFrame 
	|| window.msCancelRequestAnimationFrame 
	|| clearTimeout }
                                )();


// Create a background object
var BG = {
    Color: '#333',
    Paint: function(){
	ctx.fillStyle = this.Color;
	ctx.fillRect(0, 0, Width, Height);
    }
};


// Particle class
function Particle(){
    // The particles movement vector
    this.OwnVector = new Vector(10, (pi/2));

    this.CheckBounds = function()
    {
        if(this.Y - this.Radius < 0)
        {
            this.Y = this.Radius;
            this.OwnVector.Angle *= -1;
            this.OwnVector.Length = (this.OwnVector.Length * this.Elasticity) * -1 ;
        }

        if(this.Y + this.Radius > Height)
        {
            this.Y = Height - this.Radius;
            this.OwnVector.Angle *= -1;
            this.OwnVector.Length = (this.OwnVector.Length * this.Elasticity) * -1 ;
        }

        if(this.X - this.Radius <= 0 ||
           this.X + this.Radius > Width)
        {
            this.OwnVector.Angle *= -1;
            this.OwnVector.Length *= this.Elasticity;

        }

    };

    this.Move = function()
    {
        // Update position based on speed, Angle 
        this.X += Math.sin(this.OwnVector.Angle) * this.OwnVector.Length;
        this.Y -= Math.cos(this.OwnVector.Angle) * this.OwnVector.Length;
    };

    this.Reset = function()
    {
	this.X = 200;
	this.Y = 200;
    };
    this.ExperienceDrag = function()
    {
     this.OwnVector.Length *= this.Drag;   
    };

    this.ExperienceGravity = function()
    {
        this.OwnVector = AddVectors(this.OwnVector, gravity);
    };

    this.Update = function()
    {
        this.CheckBounds();
        this.ExperienceGravity();
        this.ExperienceDrag();
        this.Move();
    };
}

Particle.prototype = 
    {
        X: 50,
        Y: 50,
        Radius: 5,
        Thickness: 0,
        OwnVector: new Vector(1, 0),
        Mass: 1,
        Drag: 0.997,
        Elasticity: 1,
        Color: '#911',
        Paint: function()
        {
	    ctx.beginPath();
	    ctx.fillStyle = this.Color;
	    ctx.arc(this.X, this.Y, this.Radius, 0, pi * 2, false);
	    ctx.fill();
        }
    };
Particle.prototype.constructor = Particle;


// Main paint function
function Paint(){
    ctx.beginPath();
    BG.Paint();

    //Paint all the particles
    for (i = 0; i < ParticleArray.length; i++)
    {
        ParticleArray[i].Paint();
    }
}



function NewGame(){
    ParticleArray = [new Particle()];
    Loop();
}



function Loop(){
    init = requestAnimFrame(Loop);
    Paint();
    
    for (i = 0; i < ParticleArray.length; i++)
    {
        ParticleArray[i].Update();
    }
        
    if (120 / Counter == 1)
    {
        ParticleArray.push(new Particle());
        

        Counter = 0;
    }
    Counter++;

    if (ParticleArray.length > 10)
    {
        ParticleArray = [new Particle()];
    }
 
};
// Start the main loop
NewGame();



// Very simple vector implementation
// :---------------------------------------------------------------------------:
function Vector(Length, Angle){
    this.Length = Length;
    this.Angle = Angle;
};
Vector.prototype = 
    {
        Length: 1,
        Angle: 1
    };
Vector.prototype.constructor = Vector;


// Takes two vectors as input, returns the resulting vector from adding them
function AddVectors (vector1, vector2)
{
    var x = Math.sin(vector1.Angle) * vector1.Length + Math.sin(vector2.Angle) * vector2.Length;
    var y = Math.cos(vector1.Angle) * vector1.Length + Math.cos(vector2.Angle) * vector2.Length;

    var Angle = ((0.5 * pi) - Math.atan2(y, x));
    var Length = Math.sqrt(x*x + y*y);

    var newVec = new Vector(Length, Angle);
    return newVec;

}



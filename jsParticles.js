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
var gravity = { angle:pi, length:1.75 };

// Create counter for for creating new particles
var counter = 0;
// Create array to hold particles
var ParticleArray = [];

var dist = 999999, overlap = 0;
//Create some booleans for html interaction
var useGravity = true, useDrag = true, useCollisions = true;

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





// Particle class
// -----------------------------------------------------------------------------
function Particle(X, Y, vector, radius, mass)
{
    this.X = X || Particle.prototype.X;
    this.Y = Y || Particle.prototype.Y;
    // The particles movement vector
    this.vector = vector || Particle.prototype.vector;
    this.radius = radius || Particle.prototype.radius;
    this.mass = mass || Particle.prototype.mass;

    this.CheckBounds = function()
    {
        if (this.X > Width - this.radius)
        {
            this.X = 2 * (Width - this.radius) - this.X;
            this.vector.angle *= -1;
            this.vector.length *= this.Elasticity;
        }
        if (this.X < this.radius)
        {
            this.X = 2 * this.radius - this.X;
            this.vector.angle *= -1;
            this.vector.length *= this.Elasticity;
        }

        if(this.Y > Height - this.radius)
        {
            this.Y = 2 * (Height - this.radius) - this.Y;
            this.vector.angle = - this.vector.angle;
            this.vector.length = (this.vector.length * this.Elasticity) * -1 ;
        }

        if(this.Y  < this.radius)
        {
            this.Y = 2 * this.radius - this.Y;
            this.vector.angle = - this.vector.angle;
            this.vector.length = (this.vector.length * this.Elasticity) * -1 ;
        }
    };

    this.Move = function()
    {
        // Update position based on speed and angle 
        this.X += Math.sin(this.vector.angle) * this.vector.length;
        this.Y -= Math.cos(this.vector.angle) * this.vector.length;
    };

    this.Reset = function()
    {
	this.X = 200;
	this.Y = 200;
    };
    this.ExperienceDrag = function()
    {
        this.vector.length *= this.Drag;   
    };

    this.ExperienceGravity = function()
    {
        this.vector = AddVectors(this.vector, gravity);
    };

    this.Update = function()
    {
        this.CheckBounds();
        this.Move();
        
        if (useGravity)
        {
            this.ExperienceGravity();
        } 
        
        if (useDrag)
        {
            this.ExperienceDrag();
        } 
    };
}

Particle.prototype = 
    {
        X: 50,
        Y: 50,
        radius: 10,
        vector: { angle:(pi/4), length: 10 },
        mass: 10,
        Drag: 0.997,
        Elasticity: 0.75,
        Color: '#911',
        Paint: function()
        {
	    ctx.beginPath();
	    ctx.fillStyle = this.Color;
	    ctx.arc(this.X, this.Y, this.radius, 0, pi * 2, false);
	    ctx.fill();
        }
    };
Particle.prototype.constructor = Particle;

// Create a background object
var BG = {
    Color: '#333',
    Paint: function(){
	ctx.fillStyle = this.Color;
	ctx.fillRect(0, 0, Width, Height);
    }
};

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

function NewGame()
{

    
    Loop();
}

function Loop()
{
    init = requestAnimFrame(Loop);
    Paint();
    
    for (i = 0; i < ParticleArray.length; i++)
    {
        ParticleArray[i].Update();
        if (useCollisions)
        {
            for (j = i + 1; j < ParticleArray.length; j++)
            {
                Collide(ParticleArray[i], ParticleArray[j]);
            }
        }       
    }
    if (6 / counter == 1)
    {
        ParticleArray.push(new Particle(Width/2, 100, ({ angle:(pi/4), length:10 }), (ParticleArray.length + 1) / 2, ParticleArray.length));
        counter = 0;
    }
        counter++;

    if (ParticleArray.length > 40)
    {
        ParticleArray = [];

    }
};

// Start the main loop
NewGame();




// Collision function for round particles
function Collide(p1, p2)
{

    // Calculate delta x, delta y and then the hypothenuse between for actual distance
    var dx = Math.abs(p1.X - p2.X);
    var dy = Math.abs(p1.Y - p2.Y);

    var dist = Math.sqrt((dx*dx) + (dy*dy));

    if (dist <= p1.radius + p2.radius)
    {

        var tangent = Math.atan2(dy, dx) + 0.5 * pi;
        var total_mass = p1.mass + p2.mass;        

        p1.vector = AddVectors(
            { 
                angle:p1.vector.angle, 
                length:(p1.vector.length * 
                        (p1.mass-p2.mass)/total_mass) 
            }, 
            { 
                angle:tangent, 
                length:(2 * p2.vector.length * p2.mass/ total_mass) }
        );

        p2.vector =  AddVectors(
            { 
                angle:p2.vector.angle, 
                length:(p2.vector.length * (p2.mass-p1.mass)/total_mass) 
            }, 
            { 
                angle:(tangent + pi), 
                length:(2 * p1.vector.length * p1.mass / total_mass) 
            }
            
        );

        p1.vector.length *= p1.Elasticity;
        p2.vector.length *= p2.Elasticity;



        overlap = 0.5 * (p1.radius + p2.radius - dist + 1);
        p1.X += Math.sin(tangent) * overlap;
        p1.Y -= Math.cos(tangent) * overlap;
        p2.X -= Math.sin(tangent) * overlap;
        p2.Y += Math.cos(tangent) * overlap;
    }
}



function AddVectors (vector1, vector2)
{
    var x = Math.sin(vector1.angle) * vector1.length + Math.sin(vector2.angle) * vector2.length;
    var y = Math.cos(vector1.angle) * vector1.length + Math.cos(vector2.angle) * vector2.length;

    var angle = ((0.5 * pi) - Math.atan2(y, x));
    var length = Math.sqrt(x*x + y*y);
    
    

    return { angle: angle, length: length };
}




// Functions to toggle settings from html buttons
function toggleGravity()
{
    useGravity = !useGravity;
}

function toggleDrag()
{
    useDrag = ! useDrag;
}
function toggleCollisions()
{
    useCollisions = !useCollisions;
}

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
var gravity = { angle:pi, length: 0.1 };

// Create counter for for creating new particles
var counter = 0;
// Create array to hold particles
var particleArray = [];
var springArray = [];

var dist = 999999, overlap = 0;
//Create some booleans for html interaction
var useGravity = true, useDrag = true, useCollisions = true, spawnPartSys = true;

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
            this.vector.length *= this.elasticity;
        }
        if (this.X < this.radius)
        {
            this.X = 2 * this.radius - this.X;
            this.vector.angle *= -1;
            this.vector.length *= this.elasticity;
        }

        if(this.Y > Height - this.radius)
        {
            this.Y = 2 * (Height - this.radius) - this.Y;
            this.vector.angle = - this.vector.angle;
            this.vector.length = (this.vector.length * this.elasticity) * -1 ;
        }

        if(this.Y  < this.radius)
        {
            this.Y = 2 * this.radius - this.Y;
            this.vector.angle *= -1;
            //            this.vector.angle -= pi;
            this.vector.length = (this.vector.length * this.elasticity) * -1 ;
        }
    };

    // Update position based on speed and angle 
    this.Move = function()
    {
        this.X += Math.sin(this.vector.angle) * this.vector.length;
        this.Y -= Math.cos(this.vector.angle) * this.vector.length;
    };

    this.Reset = function()
    {
	this.X = 200;
	this.Y = 200;
    };

    // Change angle and speed by adding a vector to movement vector
    this.Accelerate = function(vector)
    {
        this.vector = AddVectors(this.vector, vector);
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
        radius: 20,
        vector: { angle:pi, length: 0 },
        mass: 10,
        Drag: 0.99,
        elasticity: 1,
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






// Spring class
// :--------------------------------------------------------------------------:
function Spring(p1, p2, length)
{
    // The particles the spring stretches between
    this.p1 = p1;
    this.p2 = p2;


    // The "natural" length of the spring
    this.length = length || Spring.prototype.length;
    // The strength of the spring                                       
    //    this.strength = strength || Spring.prototype.strength;

    //Spring constant. Is negative in calculations
    // Is "fighting" the suppression of the spring
    //    this.k = k || Spring.prototype.k;

    // Damping constant
    //  this.b = b  || Spring.prototype.b;
    // The natural frequency of the spring 
    // this.freq = (0.5 * pi) * Math.sqrt(k / (p1.mass + p2.mass));
    

    this.Paint = function()
    {
        ctx.beginPath();
        ctx.moveTo(p1.X, p1.Y);
        ctx.lineTo(p2.X, p2.Y);
        ctx.stroke();

    };

    this.Update = function()
    {

        var dx = this.p1.X - this.p2.X;
        var dy = this.p1.Y - this.p2.Y;
        var dist = Math.sqrt(dx*dx + dy*dy);
        
        var theta = Math.atan2(dy, dx);
        var force = (this.length - dist) * this.strength;
        
        this.p1.Accelerate({ angle:theta, length:(force/this.p1.mass ) }); 
        this.p2.Accelerate({ angle:theta, length:(force/this.p2.mass ) });

    };
}



Spring.prototype =
    {
        length: 100,
        strength: 0.01

    }; 

Spring.prototype.constructor = Spring;

function AddSpring(p1, p2, length)
{
    
    springArray.push(new Spring(p1, p2, length));

}

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
    for (i = 0; i < particleArray.length; i++)
    {
        particleArray[i].Paint();
    }
    
    // Paint all the springs
    for (i = 0; i < springArray.length; i++)
    {
        springArray[i].Paint();
        
    }
}
function NewGame()
{
    toggleReset();
    // var p1 = new Particle(100, 50, { angle:pi, length: 1}, 10, 100);
    // var p2 = new Particle(150, 150, { angle:pi, length: 1}, 10, 100);
    // var p3 = new Particle(50, 150, { angle:pi, length: 1}, 10, 100);
//    var p4 = new Particle(50, 150);

    // particleArray.push(p1);
    // particleArray.push(p2);
    // particleArray.push(p3);    
  //  particleArray.push(p4);
//    AddSpring(p1, p2, 100);
  //  AddSpring(p2, p3, 100);
//    AddSpring(p3, p4, 100);
    // AddSpring(p4, p1, 100);
 //  AddSpring(p3, p1, 100);
    // AddSpring(p2, p4, 100);

    Loop();
}

function Loop()
{
    init = requestAnimFrame(Loop);
    Paint();
    
    // Update Particles
    for (i = 0; i < particleArray.length; i++)
    {
        particleArray[i].Update();
        if (useCollisions)
        {
            for (j = i + 1; j < particleArray.length; j++)
            {
                Collide(particleArray[i], particleArray[j]);
            }
        }       
        
    }

    // Update Springs
    for (i = 0; i < springArray.length; i++)
    {
        springArray[i].Update();
    }

    if (spawnPartSys)
    {
        if (particleArray.length < 10)
        {

            if (60 / counter == 1)
            {
                particleArray.push(new Particle(Width/2, 100, { angle:(pi/4), length:1 }, 10, 100));
                counter = 0;
            }
        }

        counter++;

    }
};

// the main loop Game
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

        p1.vector.length *= p1.elasticity;
        p2.vector.length *= p2.elasticity;



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

function toggleReset()
{
    particleArray = [];
}

function toggleSpawnPartSys()
{
    spawnPartSys = !spawnPartSys;
    particleArray = [];
}

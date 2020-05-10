let world;

// the world
let height = 360;
let width = 570;
let steps = 10;

// the fitness
let fitness_mov = 10;  // fitness gain per move
let fitness_mit = 120; // fitness cap level for mitosis
let fitness_max = 255; // fitness max level

// the matches
let distance = 20; // Max distance of two genes considered similar 


function setup() {
    var canvas = createCanvas(width, height);
    canvas.parent('WorldOfCreatures');
    world = new World();

    mutation_rates = createSlider(100, 10000, 1000, 100);
    mutation_rates.parent('WOCMutationRates');
    crossover_rates = createSlider(100, 10000, 1000, 100);
    crossover_rates.parent('WOCCrossoverRates');
    models = createSlider(1, 4, 1);
    models.parent('WOCModels');
    pols = createSlider(0, 1, 0); 
    pols.parent('WOCPols'); 

    for (let x = 0; x < width; x += steps) {
        for (let y = 0; y < height; y += steps) {
            let a = Math.floor(Math.random() * 256);
            let b = Math.floor(Math.random() * 256);
            let c = Math.floor(Math.random() * 256);
            let z = Math.floor(Math.random() * 256);
            let cell = new Creature(x, y, a, b, c, z, Math.floor(Math.random() * 256), Math.floor(Math.random() * 40));
            world.addCreature(cell);
        }
    }
}

function draw() {
    let WOCModel = document.getElementById("WOCModel");
    let WOCPol = document.getElementById("WOCPol");
    let WOCSpecies = document.getElementById("WOCSpecies");
    let WOCCreatures = document.getElementById("WOCCreatures");
    let WOCMutationRate = document.getElementById("WOCMutationRate");
    let WOCCrossoverRate = document.getElementById("WOCCrossoverRate");
    const model = models.value();
    const pol = pols.value();
    const mutation_rate = mutation_rates.value();
    const crossover_rate = crossover_rates.value();    

    for (let i = 0; i < 1000; i ++) { world.run(model, pol, mutation_rate, crossover_rate); }

    background(230);
    world.render(); 
    if (world.creatures.length > (width * height / steps / steps)) { noLoop(); }
    if (world.creatures.length < 1) { noLoop(); }

    // Reporting
    var species = [];
    var species_count = 0;
    var creatures = 0;
    var loc_a_pop = new Array();
    var loc_b_pop = new Array();
    var loc_c_pop = new Array();
    var loc_z_pop = new Array();   
    for (var i = 0; i <= 255; i++) {
        loc_a_pop[i] = 0;
        loc_b_pop[i] = 0;
        loc_c_pop[i] = 0;
        loc_z_pop[i] = 0;
    }
    for( let i = 0; i < world.creatures.length; i++){ 
        if (world.creatures[i].fitness > 0) {
            creatures += 1;
            loc_a_pop[world.creatures[i].locA]++;
            loc_b_pop[world.creatures[i].locB]++;
            loc_c_pop[world.creatures[i].locC]++;
            loc_z_pop[world.creatures[i].locZ]++;  
            let my_gene = world.creatures[i].locA + '-' + world.creatures[i].locB + '-' + world.creatures[i].locC;
            if (typeof species[my_gene] === 'undefined' || !species[my_gene]) {
                species[my_gene] = 1;
                species_count ++;
            } else {
                species[my_gene]++;
            }                      
        }
    }    

    WOCModel.innerHTML = model;
    if (pol == 0) {WOCPol.innerHTML = '+';} else {WOCPol.innerHTML = '-';}
    WOCMutationRate.innerHTML = mutation_rate;
    WOCCrossoverRate.innerHTML = crossover_rate;
    WOCSpecies.innerHTML = species_count;
    WOCCreatures.innerHTML = creatures;
    update_canvas('locA', loc_a_pop);
    update_canvas('locB', loc_b_pop);   
    update_canvas('locC', loc_c_pop);   
    update_canvas('locZ', loc_z_pop);    
}

function update_canvas(gene, frequency) {
    let max_value = frequency.reduce(function(a, b) { return Math.max(a, b); });
    let canvas_gene = document.getElementById(gene+'Canvas').getContext("2d");
    canvas_gene.clearRect(0, 0, 255, 255);
    for (let i = 0; i <= 255; i++) {
        canvas_gene.fillStyle = 'rgba(0,0,0,0.8)';
        canvas_gene.beginPath();
        canvas_gene.moveTo(i, 100);
        canvas_gene.lineTo(i, 100-Math.ceil(frequency[i]/max_value*100));
        canvas_gene.strokeStyle = 'rgba(0,0,0,0.8)';
        canvas_gene.stroke();        
    }
}

function startWorld() {
    world = new World;
}

function World() {
    this.creatures = []; // Initialize the array
}

World.prototype.run = function(model, pol, mutation_rate, crossover_rate) {
    var creature = this.creatures[Math.floor(Math.random() * this.creatures.length)];
    creature.update(model, pol, mutation_rate, crossover_rate);
    let new_creatures = [];
    for( let i = 0; i < this.creatures.length; i++){ 
        if ( this.creatures[i].fitness > 0 ) { 
            new_creatures.push(this.creatures[i]);
        }
    }
    this.creatures = new_creatures;
}

World.prototype.addCreature = function(cell) {
    this.creatures.push(cell);
}

World.prototype.freecell = function(x, y) {
    for (let i = 0; i < this.creatures.length; i++) {
        if (this.creatures[i].x === x && this.creatures[i].y === y) {
            return false;
        }
    }
    return true;
}

World.prototype.render = function() {
    background(230);
    for (let i = 0; i < this.creatures.length; i++) {
        this.creatures[i].render();
    }
}

function Creature(x, y, a, b, c, z, e, generation) {
    this.x = x;
    this.y = y;    
    this.locA = a;
    this.locB = b;
    this.locC = c;
    this.locZ = z;
    this.fitness = e;
    this.generation = generation;   
}

Creature.prototype.update = function(model, pol, mutation_rate, crossover_rate) {
    this.generation += 1;
    let neighbours = this.neighbours();      // Array of neighbours
    let allies = this.friends_foes(neighbours, model);
    let friends = allies[0];
    let foes = allies[1];
    this.fitness = this.fitness + neighbours.length;
    // this.fitness += fitness_mov;
    this.fitness = this.fitness + friends.length * pol;
    this.fitness = this.fitness + foes.length * pol * (-1);

    if ((this.fitness > fitness_mit) && (neighbours.length < 8)) {
        var where_to_spread = Math.floor(Math.random() * (8 - neighbours.length));
        var new_x = -1;
        var new_y = -1;
        var k = 0;
        for (var i = -1; i <= 1; i++) {
            for (var j = -1; j <= 1; j++) {
                if (!(i === 0 && j === 0)) {                        
                    var test_x = this.x + i * steps;
                    var test_y = this.y + j * steps;
                    let v = createVector(test_x, test_y); // moving to vectors soon
                    if (test_x < 0) { test_x += width; }
                    if (test_x >= width) { test_x -= width; }
                    if (test_y < 0) { test_y += height; }
                    if (test_y >= height) { test_y -= height; }
                    if (world.freecell(test_x, test_y)) {
                        if (k == where_to_spread) {
                            new_x = test_x;
                            new_y = test_y;
                        }
                        k++;
                    }
                }
            }
        }

        if ((new_x != -1 && new_y != -1)) {
            this.split(new_x, new_y, mutation_rate, crossover_rate);  
        }
    }
    if (this.generation == 40) { this.fitness = 0; }
    if (this.fitness > fitness_max) { this.fitness = fitness_max; }
}

Creature.prototype.neighbours = function() {
    let neighbours = [];
    valid_x = [];
    valid_y = [];

    for (var i = -1; i <= 1; i++) {
        for (var j = -1; j <= 1; j++) {
            if (!(i === 0 && j ===0)) {
                var test_x = this.x + i * steps;
                var test_y = this.y + j * steps;
                if (test_x < 0) { test_x += width; }
                if (test_x >= width) { test_x -= width; }
                if (test_y < 0) { test_y += height; }
                if (test_y >= height) { test_y -= height; }   
                for (let i = 0; i < world.creatures.length; i++) {
                    if ((world.creatures[i].x == test_x) && (world.creatures[i].y == test_y)) {
                        if (world.creatures[i].fitness > 0){
                            neighbours.push(world.creatures[i]);
                        }
                    }
                }                             

            }
        }
    }
    return neighbours;
}

Creature.prototype.friends_foes = function(neighbours, model) {
    let friends = [];
    let foes = [];
    for (let i = 0; i < neighbours.length; i++) {
        if (model == 1) {
            if (similar(this.locC, neighbours[i].locC)) { 
                friends.push(neighbours[i]);
            } else if (opposite(this.locC, neighbours[i].locC)) {
                foes.push(neighbours[i]);
            }
        } else if (model == 2) {
             if (similar(this.locA, neighbours[i].locA)) { 
                if (similar(this.locC, neighbours[i].locC)) { 
                    friends.push(neighbours[i]);
                } else if (opposite(this.locC, neighbours[i].locC)) {
                    foes.push(neighbours[i]);
                }
            }                
        } else if (model == 3 ) {
            if (similar(this.locA, neighbours[i].locB)) {
                if (similar(this.locC, neighbours[i].locC)) { 
                    friends.push(neighbours[i]);
                } else if (opposite(this.locC, neighbours[i].locC)) {
                    foes.push(neighbours[i]);
                }
            }                  
        } else if (model == 4 ) {

            if (similar(this.locA, neighbours[i].locC)) {
                if (similar(this.locC, neighbours[i].locC)) { 
                    friends.push(neighbours[i]);
                } else if (opposite(this.locC, neighbours[i].locC)) {
                    foes.push(neighbours[i]);
                }
            }                 
       
        }
    }
    return [friends, foes];
}

Creature.prototype.split = function(new_x, new_y, mutation_rate, crossover_rate) {
    this.fitness = Math.floor(this.fitness/2);

    let a = this.locA;
    let b = this.locB;
    let c = this.locC;
    let z = this.locZ;

    let mutation = Math.floor(Math.random() * mutation_rate * 8)  
    if (mutation == 0) {
        a += Math.ceil(Math.random() * distance * 12);
        if (a > 255) { a -= 256; }
    }  else if (mutation == 1) {
        a -= Math.ceil(Math.random() * distance * 12);
        if (a < 0) { a += 256; }      
    } else if (mutation == 2) {
        b += Math.ceil(Math.random() * distance * 12);
        if (b > 255) { b -= 256; }
    }  else if (mutation == 3) {
        b -= Math.ceil(Math.random() * distance * 12);
        if (b < 0) { b += 256; }      
    } else if (mutation == 4) {
        c += Math.ceil(Math.random() * distance * 12);
        if (c > 255) { c -= 256; }
    }  else if (mutation == 5) {
        c -= Math.ceil(Math.random() * distance * 12);
        if (c < 0) { c += 256; }      
    }  else if (mutation == 6) {
        z -= Math.ceil(Math.random() * distance * 12);
        if (z < 0) { z += 256; }      
    }  else if (mutation == 7) {
        z -= Math.ceil(Math.random() * distance * 12);
        if (z < 0) { z += 256; }      
    }
    

    // Crossover
    let crossover = Math.floor(Math.random() * crossover_rate * 3);
    if (crossover == 0) {
        let t = a;
        a = b;
        b = t;        
    } else if (crossover == 1) {
        var t = a;
        a = c;
        c = t;           
    } else if (crossover == 2) {
        var t = b;
        b = c;
        c = t;    
    }
    
    let offspring = new Creature(new_x, new_y, a, b, c, z, this.fitness, 0);
    world.addCreature(offspring);
}

Creature.prototype.render = function() {
    fill(this.locA, this.locB, this.locC);
    stroke(0);
    square(this.x, this.y, steps);
}

function similar(g1, g2) {
    var gap = Math.abs(g2-g1);
    if (255 - gap < gap) {gap = 255 - gap; }
    var slope = Math.floor(Math.random() * distance * 2);
    if (gap < slope) { return true ; } else { return false; }

    // replace above with line below for exact match only
    // if (Math.abs(g2-g1) == 0) {return true;} else {return false;}
}

function opposite(g1, g2) {
    var gap = Math.abs(g2-g1);
    if (255 - gap < gap) {gap = 255 - gap; }
    gap = 128 - gap; // apply opposite
    var slope = Math.floor(Math.random() * distance * 2);
    if (gap < slope) { return true ; } else { return false; }

    // replace above with line below for exact match only
    // if (Math.abs(g2 - g1) == 128) { return true; } else { return false;}
}

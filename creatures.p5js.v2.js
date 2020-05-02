let world;

// the world
let height = 300;
let width = 450;
let steps = 6;

// the fitness
let fitness_mov = 10;  // fitness gain per move
let fitness_mit = 120; // fitness cap level for mitosis
let fitness_max = 255; // fitness max level

// the matches
let distance = 20; // Max distance of two genes considered similar 


function setup() {
    let canvas = createCanvas(width, height);
    canvas.parent('WorldOfCreatures');
    startWorld();

    // Add sliders to control while running
    mutation_rates = createSlider(100, 10000, 1000, 100);
    mutation_rates.parent('WOCMutationRates');
    crossover_rates = createSlider(100, 10000, 1000, 100);
    crossover_rates.parent('WOCCrossoverRates');
    models = createSlider(1, 4, 1);
    models.parent('WOCModels');
    pols = createSlider(0, 1, 0); 
    pols.parent('WOCPols');   
}

function startWorld() {
    world = new World();
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

    // Cycling through the map and updating creatures
    for (let i = 0; i < 40; i ++) { world.run(model, pol, mutation_rate, crossover_rate); }
    world.render(model);

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
    for ( let i = 0; i < width; i += steps){ 
        for (let j = 0; j < height; j += steps){ 
            if (world.map_of_world[i][j].fitness > 0) {
                creatures += 1;
                loc_a_pop[world.map_of_world[i][j].locA]++;
                loc_b_pop[world.map_of_world[i][j].locB]++;
                loc_c_pop[world.map_of_world[i][j].locC]++;
                loc_z_pop[world.map_of_world[i][j].locZ]++;
                var my_gene = world.map_of_world[i][j].locA + '-' + world.map_of_world[i][j].locB + '-' + world.map_of_world[i][j].locC;
                if (typeof species[my_gene] === 'undefined' || !species[my_gene]) {
                    species[my_gene] = 1;
                    species_count ++;
                } else {
                    species[my_gene]++;
                }
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
        canvas_gene.moveTo(0,i);
        canvas_gene.lineTo(Math.ceil(frequency[i]/max_value*100),i);
        canvas_gene.strokeStyle = 'rgba(0,0,0,0.8)';
        canvas_gene.stroke();        
    }
}

function World() {
	this.map_of_world = new Array();
    for (var x = 0; x < width; x += steps) {
        this.map_of_world[x] = new Array();
        for (var y = 0; y < height; y += steps) {
            this.map_of_world[x][y] = new Creature();
        }
    }
}

function count_neighbours(map, x, y, model) {
    var neighbours = 0;
    var friends = 0;
    var foes = 0;
    for (var i = -1; i <= 1; i++) {
        for (var j = -1; j <= 1; j++) {
            if (!(i == 0 && j == 0)) {
                var new_x = x + i * steps;
                var new_y = y + j * steps;
                if (new_x < 0) { new_x += width; }
                if (new_x >= width) { new_x -= width; }
                if (new_y < 0) { new_y += height; }
                if (new_y >= height) { new_y -= height; }
                if (map[new_x][new_y].fitness > 0) { 
                    neighbours += 1;
                    if (model == 1) {
                        if (similar(map[x][y].locC, map[new_x][new_y].locC)) { 
                            friends += 1;
                        } else if (opposite(map[x][y].locC, map[new_x][new_y].locC)) {
                            foes +=1;
                        }
                    } else if (model == 2) {
                        if (similar(map[x][y].locA, map[new_x][new_y].locA)) { 
                            if (similar(map[x][y].locC, map[new_x][new_y].locC)) { 
                                friends += 1;
                            } else if (opposite(map[x][y].locC, map[new_x][new_y].locC)) {
                                foes +=1;
                            }
                        }             
                    } else if (model == 3 ) {
                        if (similar(map[x][y].locA, map[new_x][new_y].locB)) {
                            if (similar(map[x][y].locC, map[new_x][new_y].locC)) { 
                                friends += 1;
                            } else if (opposite(map[x][y].locC, map[new_x][new_y].locC)) {
                                foes +=1;
                            }
                        }      
                    } else if (model == 4 ) {
                        if (similar(map[x][y].locA, map[new_x][new_y].locC)) {
                            if (similar(map[x][y].locC, map[new_x][new_y].locC)) { 
                                friends += 1;
                            } else if (opposite(map[x][y].locC, map[new_x][new_y].locC)) {
                                foes +=1;
                            }
                        }                                                    
                    }               
                }
            }
        }
    }
    return [neighbours, friends, foes];
}

function remove_multiplications(offsprings) {
    // Sets fitness to 0 for offsprings occupying the same location
    for (var i = 0; i < offsprings.length; i++) {
        for (var j = i+1; j < offsprings.length; j++) {
            if (offsprings[i].X === offsprings[j].X && offsprings[i].Y === offsprings[j].Y) {
                offsprings[i].fitness = 0;
                offsprings[j].fitness = 0;
            }
        }
    }
    return offsprings;
}


World.prototype.run = function(model, pol, mutation_rate, crossover_rate) {
    let new_map_of_world = this.map_of_world;
    let offsprings = [];
    for (let x = 0; x < width; x += steps) {
        for (let y = 0; y < height; y+= steps) {
            let fitness = this.map_of_world[x][y].fitness;
            let generation = this.map_of_world[x][y].generation;
            let see_neighbours = count_neighbours(this.map_of_world, x, y, model);
            let neighbours = see_neighbours[0]
            let friends = see_neighbours[1];
            let foes = see_neighbours[2];
            let polarization = 1;
            if (pol == 1) { polarization = -1; }
            fitness += fitness_mov;
            fitness = fitness + friends * polarization;
            fitness = fitness + foes * polarization * (-1);



            if ((fitness > fitness_mit) && (neighbours < 8)) {
                var where_to_spread = Math.floor(Math.random() * (8 - neighbours));
                var new_x = -1;
                var new_y = -1;
                for (var k = 0; k < 8; k++){
                    for (var i = -1; i <= 1; i++) {
                        for (var j = -1; j <= 1; j++) {
                            if (!(i === 0 && j ===0)) {
                                var test_x = x + i * steps;
                                var test_y = y + j * steps;
                                if (test_x < 0) { test_x += width; }
                                if (test_x >= width) { test_x -= width; }
                                if (test_y < 0) { test_y += height; }
                                if (test_y >= height) { test_y -= height; }                            
                                if (this.map_of_world[test_x][test_y].fitness == 0) {
                                    if (k === where_to_spread) {
                                        new_x = test_x;
                                        new_y = test_y;
                                    }
                                }
                            }
                        }
                    }
                }
                if ((new_x != -1 && new_y != -1)) {
                    var a = this.map_of_world[x][y].locA;
                    var b = this.map_of_world[x][y].locB;
                    var c = this.map_of_world[x][y].locC;
                    var z = this.map_of_world[x][y].locZ;
                    fitness = Math.floor(fitness / 2);
                    offsprings.push(new CreatureX(new_x, new_y, a, b, c, z, fitness, mutation_rate, crossover_rate));
                }
            }
            if (generation > 40) { fitness = 0; }
            if (fitness < 0) { fitness = 0; }
            if (fitness > fitness_max) {fitness = fitness_max;}             
            new_map_of_world[x][y].fitness = fitness;
            new_map_of_world[x][y].generation += 1;
        }
    }
    if (offsprings.length > 1) {
        offsprings = remove_multiplications(offsprings);
    }
    for (let i = 0; i < offsprings.length; i++){
        if (offsprings[i].fitness !== 0){
            new_map_of_world[offsprings[i].X][offsprings[i].Y] = new CreatureO(offsprings[i].locA, offsprings[i].locB, offsprings[i].locC, offsprings[i].locZ, offsprings[i].fitness);
        }
    }
    this.map_of_world = new_map_of_world;
}

World.prototype.render = function(model) {
    // Model defines colors to show
    background(192);
    var red = 0;
    var green = 0;
    var blue = 0;
    
    for (var x = 0; x < width; x += steps) {
        for (var y = 0; y < height; y+= steps) {
            var cell = this.map_of_world[x][y];
            red = cell.locA;
            green = cell.locB;
            blue = cell.locC;
            // if (model == 1) {red = 0; green = 0;}
            // if (model == 2) {green = 0;}
            // if (model == 3) {blue = 0;}
            // if (model == 4) {blue = 0;}
            if (cell.fitness > 0) {
                fill(red, green, blue, 128+Math.floor(cell.fitness/2));
                stroke(0);
                square(x, y, steps);
            }
        }
    }
}

function Creature() {
    // Create new random creature
    this.locA = Math.floor(Math.random() * 256); // Color Red
    this.locB = Math.floor(Math.random() * 256); // Color Green
    this.locC = Math.floor(Math.random() * 256); // Color Blue
    this.locZ = Math.floor(Math.random() * 256); // Not a Color
    this.fitness = Math.floor(Math.random() * 256);
    this.generation = Math.floor(Math.random() * 40);
}

function CreatureO(locA, locB, locC, locZ, fitness) {
    // Create creature with given genes and fitness  
    this.locA = locA; // Color Red
    this.locB = locB; // Color Green
    this.locC = locC; // Color Blue
    this.locZ = locZ; // Not a Color
    this.fitness = fitness;
    this.generation = 0;
}

function CreatureX(x, y, a, b, c, z, e, mutation_rate, crossover_rate) { 
    // Create creature on location with possible mutation from given parent
    // Mutation
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
    } else if (crossover == 3) {
        var t = b;
        b = c;
        c = t;    
    }


    // Finally the Offspring
    this.X = x;
    this.Y = y;    
    this.locA = a;
    this.locB = b;
    this.locC = c;
    this.locZ = z;
    this.fitness = e;
    this.generation = 0;
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

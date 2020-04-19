let world;

let height = 300;
let width = 450;
let steps = 6; // both height and width must be divisable by steps

let energy_mov = 10;  // Energy gain per move
let energy_mit = 150; // Energy cap level for mitosis
let energy_max = 250; // Energy max level

let mutation_rate = 100; // Probability of a mutation 1 / 100
let shuffle_rate = 100;  // Probability of recombination 1 / 100
let distance = 20;       // Max distance of two genes considered similar 
                         // and Min distance of two genes considered opposite (128 - distance)

function setup() {
    var canvas = createCanvas(width, height);
    canvas.parent('WorldOfCreatures');
    world = new World();

    // Add slider to switch model
    models = createSlider(1, 4, 2);
    models.parent('WOCModels');
}

function draw() {
    var WOCModel = document.getElementById("WOCModel");
    var WOCSpecies = document.getElementById("WOCSpecies");
    var WOCCreatures = document.getElementById("WOCCreatures");
    const model = models.value();

    // Cycling through the map and updating creatures
    for (let i = 0; i < 30; i ++) { world.run(model); }  
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
            if (world.map_of_world[i][j].energy > 0) {
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
    WOCSpecies.innerHTML = species_count;
    WOCCreatures.innerHTML = creatures;
    update_canvas('locA', loc_a_pop);
    update_canvas('locB', loc_b_pop);   
    update_canvas('locC', loc_c_pop);   
    update_canvas('locZ', loc_z_pop);
}

function update_canvas(gene, frequency) {
    var max_value = frequency.reduce(function(a, b) { return Math.max(a, b); });
    var canvas_gene = document.getElementById(gene+'Canvas').getContext("2d");
    canvas_gene.clearRect(0, 0, 255, 255);
    for (var i = 0; i <= 255; i++) {
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
            var a = Math.floor(Math.random() * 256);
            var b = Math.floor(Math.random() * 256);
            var c = Math.floor(Math.random() * 256);
            var z = Math.floor(Math.random() * 256);
            this.map_of_world[x][y] = new Creature(a, b, c, z, 100);
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
                if (map[new_x][new_y].energy > 0) { 
                    neighbours += 1;
                    if (model == 1) {
                        if (similar(map[x][y].locA, map[new_x][new_y].locA)) { 
                            friends += 1;
                        } 
                        if (opposite(map[x][y].locA, map[new_x][new_y].locA)) { 
                            foes += 1;
                        }
                    } else if (model == 2) {
                        if (similar(map[x][y].locA, map[new_x][new_y].locB)) {
                            if (similar(map[x][y].locB, map[new_x][new_y].locA)) { friends += 1; }
                        }
                        if (opposite(map[x][y].locA, map[new_x][new_y].locB)) {
                            if (similar(map[x][y].locB, map[new_x][new_y].locA)) { foes += 1; }
                        }                
                    } else if (model == 3 ) {
                        if (similar(map[x][y].locA, map[new_x][new_y].locB)) {
                            if (similar(map[x][y].locB, map[new_x][new_y].locA)) {
                                if (similar(map[x][y].locC, map[new_x][new_y].locC)) {
                                    friends += 1;
                                }

                            }                            
                        }
                        if (opposite(map[x][y].locA, map[new_x][new_y].locB)) {
                            if (similar(map[x][y].locB, map[new_x][new_y].locA)) {
                                if (opposite(map[x][y].locC, map[new_x][new_y].locC)) {
                                    foes += 1;
                                }

                            }                            
                        }
                    } else if (model == 4 ) {
                        if (similar(map[x][y].locA, map[new_x][new_y].locB)) {
                            if (similar(map[x][y].locB, map[new_x][new_y].locB)) { friends += 1; }
                        }
                        if (similar(map[x][y].locA, map[new_x][new_y].locB)) {
                            if (opposite(map[x][y].locB, map[new_x][new_y].locB)) { foes += 1; }
                        }                            
                    }               
                }
            }
        }
    }
    return [neighbours, friends, foes];
}

function remove_multiplications(offsprings) {
    for (var i = 0; i < offsprings.length; i++) {
        for (var j = i+1; j < offsprings.length; j++) {
            if (offsprings[i].X === offsprings[j].X && offsprings[i].Y === offsprings[j].Y) {
                offsprings[i].energy = 0;
                offsprings[j].energy = 0;
            }
        }
    }
    return offsprings;
}


World.prototype.run = function(model) {
    var a_brave_new_world = this.map_of_world;
    var offsprings = [];
    for (var x = 0; x < width; x += steps) {
        for (var y = 0; y < height; y+= steps) {
            var energy = this.map_of_world[x][y].energy;
            var generation = this.map_of_world[x][y].generation;
            var see_neighbours = count_neighbours(this.map_of_world, x, y, model);
            var neighbours = see_neighbours[0]
            var friends = see_neighbours[1];
            var foes = see_neighbours[2];

            energy += energy_mov;
            energy += friends * energy_mov;
            energy -= foes * energy_mov * neighbours;
            //energy -= neighbours * energy_mov;
            //energy -= generation;            

            
            

            if (energy < 0) { energy = 0; }
            if (energy > energy_max) {energy = energy_max;} 

            if ((energy > energy_mit) && (neighbours < 8)) {
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
                                if (this.map_of_world[test_x][test_y].energy == 0) {
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
                    energy = Math.floor(energy / 2);
                    offsprings.push(new CreatureX(new_x, new_y, a, b, c, z, energy));
                }
            }
            if (generation > 80) {energy = 0;}
            a_brave_new_world[x][y].energy = energy;
            a_brave_new_world[x][y].generation += 1;
        }
    }
    if (offsprings.length > 1) {
        offsprings = remove_multiplications(offsprings);
    }
    for (var i = 0; i < offsprings.length; i++){
        if (offsprings[i].energy !== 0){
            a_brave_new_world[offsprings[i].X][offsprings[i].Y] = new Creature(offsprings[i].locA, offsprings[i].locB, offsprings[i].locC, offsprings[i].locZ, offsprings[i].energy);
        }
    }
    this.map_of_world = a_brave_new_world;
}

World.prototype.energy = function() {
    var energy = 0;
    for (var x = 0; x < width; x += steps) {
        for (var y = 0; y < height; y+= steps) {
            if (this.map_of_world[x][y].energy < 0) {
                this.map_of_world[x][y].energy = 0;
            }
            energy += this.map_of_world[x][y].energy;
        }
    }    
    return energy;
}

World.prototype.render = function(model) {
    background(255);
    var red = 0;
    var green = 0;
    var blue = 0;
    
    for (var x = 0; x < width; x += steps) {
        for (var y = 0; y < height; y+= steps) {
            var cell = this.map_of_world[x][y];
            red = cell.locA;
            green = cell.locB;
            blue = cell.locC;
            if (model == 1) {green=0;blue = 0;}
            if (model == 2) {blue = 0;}
            if (model == 4) {blue = 0;}
            if (cell.energy > 0) {
                fill(red, green, blue);
                stroke(56);
                square(x, y, steps);
            }
        }
    }
}

function Creature(a, b, c, z, e) {  
    this.locA = a;
    this.locB = b;
    this.locC = c;
    this.locZ = z;
    this.energy = e;
    this.generation = 0;
}

function CreatureX(x, y, a, b, c, z, e) { 
    let mutate = Math.floor(Math.random() * mutation_rate);
    let direction = 1;
    if ((Math.floor(Math.random() * 2)) == 0) {
        direction = -1;
    }
    let amount = Math.ceil(Math.random() * 128);
    direction *= amount;
    this.X = x;
    this.Y = y;
    if (mutate == 0) {
        let select = Math.floor(Math.random() * 3);
        if (select == 0) {
            a += direction;
            if (a > 255) { a -= 256 }
            if (a < 0) { a += 256 }
        } else if (select === 1) {
            b += direction;
            if (b > 255) { b -= 256 }
            if (b < 0) { b += 256 }
        } else if (select === 2) {
            c += direction;
            if (c > 255) { c -= 256 }
            if (c < 0) { c += 256 }
        }
    }
    let shuffle = Math.floor(Math.random() * shuffle_rate);
    if (shuffle == 0) {
        let select = Math.floor(Math.random() * 3);
        if (select == 0) {
            var t = a;
            a = b;
            b = t;
        } else if (shuffle === 1) {
            var t = a;
            a = c;
            c = t;
        } else if (shuffle === 2) {
            var t = b;
            b = c;
            c = t;
        }
    }
    this.locA = a;
    this.locB = b;
    this.locC = c;
    this.locZ = z;
    this.energy = e;
    this.generation = 0;
}

  
function similar(g1, g2) {
    var gap = Math.abs(g2-g1);
    if (255 - gap < gap) {gap = 255 - gap; }
    var probability = Math.ceil(Math.random() * distance * 2);
    if (gap < probability) { 
        return true ; 
    } else { 
        return false; 
    }
}

function opposite(g1, g2) {
    var gap = Math.abs(g2-g1);
    if (255 - gap < gap) {gap = 255 - gap; }
    gap = 128 - gap;
    var probability = Math.ceil(Math.random() * distance * 2);
    if (gap < probability) { 
        return true ; 
    } else { 
        return false; 
    }
}

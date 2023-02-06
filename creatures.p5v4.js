// Creatures - A Simulation
// See https://muuuh.com/creatures/ for notes and explanations
// Author: Karl-Heinz Müller

let world;

// the world
let width = 96;  // 768 px
let height = 64; // 512 px
let steps = 8;

// the fitness
let fitness_mit = 140; // fitness cap level for mitosis

// the matches
let distance = 90;   // Max distance of two genes considered similar/opposite
let mut_range = 45;  // Max range of possible mutation away from original value

function setup() {
    let canvas = createCanvas(width*steps, height*steps);
    canvas.parent('WorldOfCreatures');
    startWorld();

    // Add sliders to control while running
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
    let WOCCreatures = document.getElementById("WOCCreatures");
    const model = models.value();
    const pol = pols.value();
    const mutation_rate = 1/100;
    const crossover_rate = 1/100;

    // Cycling through the map and updating creatures 30 update / render
    for (let i = 0; i < 50; i++) { 
        world.update(model, pol, mutation_rate, crossover_rate); 
    }
    // world.update(model, pol, mutation_rate, crossover_rate); 
    world.render();

    // Reporting
    var species = [];
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
    for ( let i = 0; i < width; i++){ 
        for (let j = 0; j < height; j++){ 
            if (world.pool[i][j].fitness > 0) {
                creatures += 1;
                current_fitness = world.pool[i][j].fitness;
                current_generation = world.pool[i][j].generation;
                loc_a_pop[world.pool[i][j].locA]++;
                loc_b_pop[world.pool[i][j].locB]++;
                loc_c_pop[world.pool[i][j].locC]++;
                loc_z_pop[world.pool[i][j].locZ]++;
                var my_gene = world.pool[i][j].locA + '-' + world.pool[i][j].locB + '-' + world.pool[i][j].locC;
                if (typeof species[my_gene] === 'undefined' || !species[my_gene]) {
                    species[my_gene] = 1;
                } else {
                    species[my_gene]++;
                }
            }

        }
    }
    WOCModel.innerHTML = model;
    if (pol == 0) {WOCPol.innerHTML = '+';} else {WOCPol.innerHTML = '-';}
    WOCCreatures.innerHTML = creatures;
    update_canvas('locA', loc_a_pop);
    update_canvas('locB', loc_b_pop);   
    update_canvas('locC', loc_c_pop);   
    update_canvas('locZ', loc_z_pop);
    if (creatures < 1) { noLoop(); }
}

function update_canvas(gene, frequency) {
    // let max_value = frequency.reduce(function(a, b) { return Math.max(a, b); });
    let max_value = frequency.reduce((a, b) => Math.max(a, b));
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

function World() {
    this.pool = [];
    for (let x = 0; x < width; x ++) {
      this.pool[x] = [];
      for (let y = 0; y < height; y ++) {
        this.pool[x][y] = new CreatureNull(x, y);
      }
    }
    this.pool[48][32] = new CreatureFix(48, 32);
}

function CreatureNull(x, y) {
  // Create a random new creature at indicated position
  this.geo = createVector(x, y);
  this.locA = 0; // Color Red
  this.locB = 0; // Color Green
  this.locC = 0; // Color Blue
  this.locZ = 0; // Not a Color
  this.fitness = 0;
  this.generation = 0;
}

function CreatureFix(x, y) {
  // Create a random new creature at indicated position
  this.geo = createVector(x, y);
  this.locA = 62;    // Color Red
  this.locB = 204;   // Color Green
  this.locC = 39;    // Color Blue
  this.locZ = 128;   // Not a Color
  this.fitness = 40;
  this.generation = 0;
}  
  
function CreatureR(x, y) {
  // Create a random new creature at indicated position
  this.geo = createVector(x, y);
  this.locA = Math.floor(Math.random() * 256); // Color Red
  this.locB = Math.floor(Math.random() * 256); // Color Green
  this.locC = Math.floor(Math.random() * 256); // Color Blue
  this.locZ = Math.floor(Math.random() * 256); // Not a Color
  this.fitness = Math.floor(Math.random() * 256) + 1;
  this.generation = 0;
}
  
function CreatureO(x, y, a, b, c, z, f, g) {
  // Create a random new creature at indicated position
  this.geo = createVector(x, y);
  this.locA = a; // Color Red
  this.locB = b; // Color Green
  this.locC = c; // Color Blue
  this.locZ = z; // Not a Color
  this.fitness = f;
  this.generation = g;
}
  
function CreatureX(x, y, parent, mutation_rate) {
  // Create creature by cell division (mitosis)
  a = parent.locA;
  b = parent.locB;
  c = parent.locC;
  z = parent.locZ;
  e = Math.floor(parent.fitness / 2);
  mutation_rate = 1/100;

  // Mutation
  if (Math.random() < mutation_rate) {
  let mutation = Math.floor(Math.random() * 6)
    if (mutation == 0) {
      a += Math.ceil(Math.random() * mut_range);
      if (a > 255) { a -= 256; }
    } else if (mutation == 1) {
      a -= Math.ceil(Math.random() * mut_range);
      if (a < 0) { a += 256; }
    } else if (mutation == 2) {
      b += Math.ceil(Math.random() * mut_range);
      if (b > 255) { b -= 256; }
    } else if (mutation == 3) {
      b -= Math.ceil(Math.random() * mut_range);
      if (b < 0) { b += 256; }
    } else if (mutation == 4) {
      c += Math.ceil(Math.random() * mut_range);
      if (c > 255) { c -= 256; }
    } else if (mutation == 5) {
      c -= Math.ceil(Math.random() * mut_range);
      if (c < 0) { c += 256; }
    }
  }

  // The offspring
  this.geo = createVector(x, y);
  this.locA = a;
  this.locB = b;
  this.locC = c;
  this.locZ = z;
  this.fitness = e;
  this.generation = 0;
}
  
function CreatureM(x, y, parent, partner, mutation_rate, crossover_rate) {
  a = selectAllele(parent.locA, partner.locA);
  b = selectAllele(parent.locB, partner.locA);
  c = selectAllele(parent.locC, partner.locC);
  z = selectAllele(parent.locZ, partner.locZ);
  e = Math.floor(parent.fitness / 2);
  mutation_rate = 1/100;
  crossover_rate = 1/100;

  // Mutation
  if (Math.random() < mutation_rate) {
    let mutation = Math.floor(Math.random() * 6)
    if (mutation == 0) {
      a += Math.ceil(Math.random() * mut_range);
      if (a > 255) { a -= 256; }
    } else if (mutation == 1) {
      a -= Math.ceil(Math.random() * mut_range);
      if (a < 0) { a += 256; }
    } else if (mutation == 2) {
      b += Math.ceil(Math.random() * mut_range);
      if (b > 255) { b -= 256; }
    } else if (mutation == 3) {
      b -= Math.ceil(Math.random() * mut_range);
      if (b < 0) { b += 256; }
    } else if (mutation == 4) {
      c += Math.ceil(Math.random() * mut_range);
      if (c > 255) { c -= 256; }
    } else if (mutation == 5) {
      c -= Math.ceil(Math.random() * mut_range);
      if (c < 0) { c += 256; }
    } else if (mutation == 6) {
      z -= Math.ceil(Math.random() * mut_range);
      if (z < 0) { z += 256; }
    } else if (mutation == 7) {
      z -= Math.ceil(Math.random() * mut_range);
      if (z < 0) { z += 256; }
    }
  }

  // Crossover
  if (Math.random() < crossover_rate) {
    let crossover = Math.floor(Math.random() * 3);
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
  }  

  // Finally the Offspring
  this.geo = createVector(x, y);
  this.locA = a;
  this.locB = b;
  this.locC = c;
  this.locZ = z;
  this.fitness = e;
  this.generation = 0;
}
  
function remove_multiplications(offsprings) {
    // Sets fitness to 0 for offsprings occupying the same location
    for (let i = 0; i < offsprings.length; i++) {
        for (let j = i+1; j < offsprings.length; j++) {
          if (i != j && offsprings[i].fitness > 0 && offsprings[j].fitness > 0){
            if (offsprings[i].geo.x == offsprings[j].geo.x && offsprings[i].geo.y == offsprings[j].geo.y) {
              if (offsprings[i].fitness > offsprings[j].fitness) {offsprings[j].fitness = 0;}
              else if (offsprings[j].fitness > offsprings[i].fitness) {offsprings[i].fitness = 0;}
              else {
                // Is this really a 50:50 chance? or slightly biased?
                if (Math.random() < 0.5 ) {
                  offsprings[i].fitness = 0;
                } else {
                  offsprings[j].fitness = 0;
                }                   
              }
            
            }
          }
        }
    }
    return offsprings;
}
  
World.prototype.update = function(model, pol, mutation_rate, crossover_rate) {
  const newPool = this.pool.map(row => row.map(item => ({...item})));
  const shuffled = shuffledIndexOfArray(newPool)

  let offsprings = [];
  let polarization = 1;

  for (const [x, y] of shuffled) {
    if (this.pool[x][y].fitness > 0) {
      let fitness = this.pool[x][y].fitness;
      let generation = this.pool[x][y].generation + 1;
      let allNeighbours = getNeighbours(this.pool, x, y, model);

      if (pol == 1) { polarization = -1; } else { polarization = 1; }
      fitness = fitness + allNeighbours[1].length * polarization;
      fitness = fitness + allNeighbours[2].length * polarization * (-1);
      fitness = fitness + allNeighbours[3].length;
      
      if (fitness > fitness_mit) {
        if (allNeighbours[1].length + allNeighbours[2].length < 7) {
          if (allNeighbours[3].length>0){
            let newCell = random(allNeighbours[3]);
            if (newCell){
              if (allNeighbours[2].length > 0) {
                // Meiosis
                let partner = random(allNeighbours[2]);
                offsprings.push(new CreatureM(newCell.geo.x, newCell.geo.y, newPool[x][y], partner, mutation_rate, crossover_rate));
              } else {
                // Mitosis, no cross over
                offsprings.push(new CreatureX(newCell.geo.x, newCell.geo.y, newPool[x][y], mutation_rate));
              }
            }
          }
          fitness = fitness - Math.floor(fitness/2);
        }
      }
      if (fitness > 255) { fitness = 255; }
      if (generation > 40) {fitness = 0;}
      newPool[x][y].fitness = fitness;
      newPool[x][y].generation = generation;
    }
  }
  if (offsprings.length > 1) {
    offsprings = remove_multiplications(offsprings);
  }
  for (let i = 0; i < offsprings.length; i++) {
    // Only place new offspring if the spot is empty
    if (offsprings[i].fitness > 0 && newPool[offsprings[i].geo.x][offsprings[i].geo.y].fitness == 0) {
      newPool[offsprings[i].geo.x][offsprings[i].geo.y] = new CreatureO(offsprings[i].geo.x, offsprings[i].geo.y, offsprings[i].locA, offsprings[i].locB, offsprings[i].locC, offsprings[i].locZ, offsprings[i].fitness, 0);
    } else {
      newPool[offsprings[i].geo.x][offsprings[i].geo.y].fitness += offsprings[i].fitness;
      if (newPool[offsprings[i].geo.x][offsprings[i].geo.y].fitness > 255) {
        newPool[offsprings[i].geo.x][offsprings[i].geo.y].fitness = 255;
      }
    }
  }
  // this.pool = newPool; // copy back?
  this.pool = newPool.map(row => row.map(item => ({...item})));
}
  
World.prototype.render = function() {
  // Model defines colors to show
  background(0);
  let red = 0;
  let green = 0;
  let blue = 0;
  let opacity = 0;

  // How about average color?

  for (let x = 0; x < width; x ++) {
    for (let y = 0; y < height; y ++) {
      let cell = this.pool[x][y];

      red = cell.locA;
      green = cell.locB;
      blue = cell.locC;
      opacity = cell.fitness; //129 + Math.floor(cell.fitness / 2);
            
      if (cell.fitness > 0) {
        fill(red, green, blue, opacity);
        stroke(0);
        square(x*steps, y*steps, steps);
      } else {
        let colors = getNeighboursColors(this.pool, x, y);
        red = colors[0];
        green = colors[1];
        blue = colors[2];
        opacity = colors[3];
        // fill(red, green, blue, 255);
        fill(0, 0, 0, 255);
        stroke(0);
        square(x*steps, y*steps, steps);
      }
    }
  }
}

function getNeighboursColors(pool, x, y) {
  let Red = 0;
  let Green = 0;
  let Blue = 0;
  let Opacity = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      let new_x = x + i;
      let new_y = y + j;
      
      // Get from Flat World to Globe
      if (new_x < 0) {new_x = width + new_x}
      if (new_y < 0) {new_y = height + new_y}
      if (new_x >= width) {new_x = new_x - width}
      if (new_y >= height) {new_y = new_y - height}

      if (pool[new_x][new_y].fitness > 0){
        Red += pool[new_x][new_y].locA
        Green += pool[new_x][new_y].locB
        Blue += pool[new_x][new_y].locC
        Opacity += pool[new_x][new_y].fitness
      }
    }
  }
  Red = Math.floor(Red/8);
  Green = Math.floor(Green/8);
  Blue = Math.floor(Blue/8);
  Opacity = Math.floor(Opacity/8);

  return 0, 0, 0, 0
}
  
function getNeighbours(pool, x, y, model) {
  // Returns neighbors, friends, foes and empty cells for the creature at x/y. 
  let neighbors = [];
  let friends = [];
  let foes = [];
  let empties = [];
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i == 0 && j == 0) {} else {
        let new_x = x + i;
        let new_y = y + j;
        
        // Get from Flat World to Globe
        if (new_x < 0) {new_x = width + new_x}
        if (new_y < 0) {new_y = height + new_y}
        if (new_x >= width) {new_x = new_x - width}
        if (new_y >= height) {new_y = new_y - height}

        if (new_x >= 0 && new_x < width && new_y >= 0 && new_y < height) {     
          if (pool[new_x][new_y].fitness > 0) {
            neighbors.push(pool[new_x][new_y]);
            if (model == 1) {
              if (similar(pool[x][y].locC, pool[new_x][new_y].locC)) {
                friends.push(pool[new_x][new_y]);
              } else if (opposite(pool[x][y].locC, pool[new_x][new_y].locC)) {
                foes.push(pool[new_x][new_y]);
              }
            } else if (model == 2) {
              if (similar(pool[x][y].locA, pool[new_x][new_y].locA)) {
                if (similar(pool[x][y].locC, pool[new_x][new_y].locC)) {
                  friends.push(pool[new_x][new_y]);
                } else if (opposite(pool[x][y].locC, pool[new_x][new_y].locC)) {
                  foes.push(pool[new_x][new_y]);
                }
              }
            } else if (model == 3) {
              if (similar(pool[x][y].locA, pool[new_x][new_y].locB)) {
                if (similar(pool[x][y].locC, pool[new_x][new_y].locC)) {
                  friends.push(pool[new_x][new_y]);
                } else if (opposite(pool[x][y].locC, pool[new_x][new_y].locC)) {
                  foes.push(pool[new_x][new_y]);
                }
              }
            } else if (model == 4) {
              if (similar(pool[x][y].locA, pool[new_x][new_y].locC)) {
                if (similar(pool[x][y].locC, pool[new_x][new_y].locC)) {
                  friends.push(pool[new_x][new_y]);
                } else if (opposite(pool[x][y].locC, pool[new_x][new_y].locC)) {
                  foes.push(pool[new_x][new_y]);
                }
              }
            }
          }
          else {
            empties.push(pool[new_x][new_y]);
          }
        } // why do I get values 96 and 64
      }
    }
  }
  return [neighbors, friends, foes, empties];
}
  
function selectAllele(allele1, allele2) {
  // Returns one of two alleles at 50% chance
  return Math.random() < 0.5 ? allele1 : allele2;
}

function similar(allele1, allele2) {
  let gap = (allele1 > allele2) ? allele1 - allele2 : allele2 - allele1;
  if (gap > 128) { gap = 256-gap; }
  // let slope = Math.floor(Math.random() * distance * 2);
  if (gap < distance) {
    return true;
  } else {
    return false;
  }
}

function opposite(allele1, allele2) {
  allele2 = (allele2 > 127) ? allele2 - 128: allele2 + 128;
  let gap = (allele1 > allele2) ? allele1 - allele2 : allele2 - allele1;
  if (gap > 128) { gap = 256-gap; }
  if (gap < distance) {
    return true;
  } else {
    return false;
  }
}

function shuffledIndexOfArray(array) {
  let indices = Array.from({ length: array.length * array[0].length }, (_, i) => [Math.floor(i / array[0].length), i % array[0].length]);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}


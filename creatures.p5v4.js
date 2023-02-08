// Creatures - A Simulation
// See https://muuuh.com/creatures/ for notes and explanations
// Author: Karl-Heinz Müller

let world;
let model_details = [];

// the world
let width = 96;  // 768 px
let height = 64; // 512 px
let steps = 8;

// the fitness
let fitness_mit = 160; // fitness cap level for mitosis

// the matches
let distance = 4;   // Max distance of two genes considered similar/opposite
let mut_range = 64;  // Max range of possible mutation away from original value

let cycles = 0; // World loop counter

function setup() {
    let canvas = createCanvas(width*steps, height*steps);
    canvas.parent('WorldOfCreatures');
    startWorld();

    // Add sliders to control while running
    models = createSlider(0, 35, 11);
    models.parent('WOCModels');
    pols = createSlider(0, 1, 0); 
    pols.parent('WOCPols');   
 
}

function startWorld() {
  world = new World();
}

function draw() {
    cycles++;

    let WOCModel = document.getElementById("WOCModel");
    let WOCPol = document.getElementById("WOCPol");
    let WOCSpecies = document.getElementById("WOCSpecies");    
    let WOCCreatures = document.getElementById("WOCCreatures");
    let WOCCalc = document.getElementById("WOCCalc");
    let WOCRender = document.getElementById("WOCRender");
    let WOCCycles = document.getElementById("WOCCycles");
    const model = models.value();
    const pol = pols.value();
    const mutation_rate = 1/100;
    const crossover_rate = 1/100;



    // Cycling through the map and updating creatures 30 update / render
    var startDateCalc = new Date(); 
    for (let i = 0; i < 10; i++) { 
      world.update(model, pol, mutation_rate, crossover_rate); 
    }
    var endDateCalc   = new Date();

    var startDate = new Date();
    world.render();
    var endDate   = new Date();

    // Reporting
    var species = {};
    var creatures = 0;
    var loc_a_pop = new Array();
    var loc_b_pop = new Array();
    var loc_c_pop = new Array();
    var loc_z_pop = new Array();
    var loc_e_pop = new Array();
    for (var i = 0; i <= 255; i++) {
        loc_a_pop[i] = 0;
        loc_b_pop[i] = 0;
        loc_c_pop[i] = 0;
        loc_z_pop[i] = 0;
        loc_e_pop[i] = 0;
    }
    for ( let i = 0; i < width; i++){ 
        for (let j = 0; j < height; j++){ 
            if (world.pool[i][j].fitness > 0) {
                creatures += 1;
                loc_a_pop[world.pool[i][j].locA]++;
                loc_b_pop[world.pool[i][j].locB]++;
                loc_c_pop[world.pool[i][j].locC]++;
                loc_z_pop[world.pool[i][j].locZ]++;
                loc_e_pop[world.pool[i][j].fitness]++;
                let my_gene = world.pool[i][j].locA + '-' + world.pool[i][j].locB + '-' + world.pool[i][j].locC;
                if (typeof species[my_gene] === 'undefined') { species[my_gene] = 0; }
                species[my_gene]++;
            } 
        }
    }

    let species_count = 0;
    for (const [key, value] of Object.entries(species)) {
      if (value > 1) { species_count++; }
    }
    

    let models_text = [];
    let seeing = ['AA', 'AB', 'AC', 'BB', 'BC', 'CC']; // These are the options for seen/not seen
    let eating = ['!AA', '!AB', '!AC', '!BB', '!BC', '!CC']; // These are the options for friend/foe
    // It appears that there are 36 models although some of them are redundant, like [simAA, oppBB] vs [simBB, oppCC], or senseless, like [simAA, oppAA]
    for (let k = 0; k < seeing.length; k++) {
      for (let l = 0; l < eating.length; l++) {
          models_text.push([seeing[k], eating[l]])
      }
    }

    WOCModel.innerHTML = model + ": " + models_text[model];
    if (pol == 0) {WOCPol.innerHTML = '+';} else {WOCPol.innerHTML = '-';}
    WOCSpecies.innerHTML = species_count;
    WOCCreatures.innerHTML = creatures;
    WOCCalc.innerHTML = (endDateCalc.getTime() - startDateCalc.getTime());
    WOCRender.innerHTML = (endDate.getTime() - startDate.getTime());
    WOCCycles.innerHTML = cycles;

    update_canvas('locA', loc_a_pop, 'rgba(150,0,0,0.9)');
    update_canvas('locB', loc_b_pop, 'rgba(0,150,0,0.9)');   
    update_canvas('locC', loc_c_pop, 'rgba(0,0,150,0.9)');   
    update_canvas('locZ', loc_z_pop, 'rgba(0,0,0,0.9)');
    update_canvas('Energy', loc_e_pop, 'rgba(0,0,0,0.7)');
    if (creatures < 1) { noLoop(); }
}

function update_canvas(gene, frequency, filling) {
    let max_value = frequency.reduce((a, b) => Math.max(a, b));
    let canvas_gene = document.getElementById(gene+'Canvas').getContext("2d");
    canvas_gene.clearRect(0, 0, 255, 255);
    for (let i = 0; i <= 255; i++) {
      if (frequency[i] > 2) {
        canvas_gene.fillStyle = filling;
        canvas_gene.beginPath();
        canvas_gene.moveTo(i, 100);
        canvas_gene.lineTo(i, 100-Math.ceil(frequency[i]/max_value*100));
        canvas_gene.strokeStyle = filling;
        canvas_gene.stroke();
      }    
    }
}

function World() {
    this.pool = [];
    for (let x = 0; x < width; x ++) {
      this.pool[x] = [];
      for (let y = 0; y < height; y ++) {
        if (Math.random() < 0.001) {
          this.pool[x][y] = new CreatureR(x, y);
        } else {
          this.pool[x][y] = new CreatureNull(x, y);
        }
      }
    }
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
  mutation_rate = 1/1000;

  // Mutation
  if (Math.random() < mutation_rate) {
  let mutation = Math.floor(Math.random() * 8)
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
      z += Math.ceil(Math.random() * mut_range);
      if (z > 255) { z -= 256; }
    } else if (mutation == 7) {
      z -= Math.ceil(Math.random() * mut_range);
      if (z < 0) { z += 256; }
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
  b = selectAllele(parent.locB, partner.locB);
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

  // const mutations = [
  //   { var: a, op: 1 },
  //   { var: a, op: -1 },
  //   { var: b, op: 1 },
  //   { var: b, op: -1 },
  //   { var: c, op: 1 },
  //   { var: c, op: -1 },
  //   { var: z, op: 1 },
  //   { var: z, op: -1 },
  // ];
  
  // const { var: target, op } = mutations[mutation];
  // target += Math.ceil(Math.random() * mut_range) * op;
  // if (target > 255) { target -= 256; }
  // else if (target < 0) { target += 256; }

  // Crossover, if triggered swaps random two genes of the available six possible combinations
  // if (Math.random() < crossover_rate) {
  //   let swaps = [[a, b], [a, c], [a, z], [b, c], [b, z], [c, z]];
  //   swaps[Math.floor(Math.random() * swaps.length)].reverse();
  // }


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
  const shuffled = shuffledIndexOfArray(this.pool)

  let offsprings = [];
  let polarization = (pol == 0) ? -1: 1;

  // Evaluating Fitness of all Creatures
  for (const [x, y] of shuffled) {
    let fitness = this.pool[x][y].fitness; // Remove on each Turn
    if (fitness > 0) {
      let generation = this.pool[x][y].generation + 1;
      let allNeighbors = getNeighbors(this.pool, x, y);

      for (let i = 0; i < allNeighbors[0].length; i++) {
        let neighbor = allNeighbors[0][i];
        let friend = false;
        let foe = false;
        let unknown = false;

        let AA = similar(this.pool[x][y].locA, neighbor.locA)
        let AB = similar(this.pool[x][y].locA, neighbor.locB)
        let AC = similar(this.pool[x][y].locA, neighbor.locC)
        let BB = similar(this.pool[x][y].locB, neighbor.locB)
        let BC = similar(this.pool[x][y].locB, neighbor.locC)
        let CC = similar(this.pool[x][y].locC, neighbor.locC)        

        if (model ==  0) { AA ? (AA ? friend=true : foe=true) : unknown=true }
        if (model ==  1) { AA ? (AB ? friend=true : foe=true) : unknown=true }
        if (model ==  2) { AA ? (AC ? friend=true : foe=true) : unknown=true }
        if (model ==  3) { AA ? (BB ? friend=true : foe=true) : unknown=true }
        if (model ==  4) { AA ? (BC ? friend=true : foe=true) : unknown=true }
        if (model ==  5) { AA ? (CC ? friend=true : foe=true) : unknown=true }

        if (model ==  6) { AB ? (AA ? friend=true : foe=true) : unknown=true }
        if (model ==  7) { AB ? (AB ? friend=true : foe=true) : unknown=true }
        if (model ==  8) { AB ? (AC ? friend=true : foe=true) : unknown=true }
        if (model ==  9) { AB ? (BB ? friend=true : foe=true) : unknown=true }
        if (model == 10) { AB ? (BC ? friend=true : foe=true) : unknown=true }
        if (model == 11) { AB ? (CC ? friend=true : foe=true) : unknown=true }

        if (model == 12) { AC ? (AA ? friend=true : foe=true) : unknown=true }
        if (model == 13) { AC ? (AB ? friend=true : foe=true) : unknown=true }
        if (model == 14) { AC ? (AC ? friend=true : foe=true) : unknown=true }
        if (model == 15) { AC ? (BB ? friend=true : foe=true) : unknown=true }
        if (model == 16) { AC ? (BC ? friend=true : foe=true) : unknown=true }
        if (model == 17) { AC ? (CC ? friend=true : foe=true) : unknown=true }

        if (model == 18) { BB ? (AA ? friend=true : foe=true) : unknown=true }
        if (model == 19) { BB ? (AB ? friend=true : foe=true) : unknown=true }
        if (model == 20) { BB ? (AC ? friend=true : foe=true) : unknown=true }
        if (model == 21) { BB ? (BB ? friend=true : foe=true) : unknown=true }
        if (model == 22) { BB ? (BC ? friend=true : foe=true) : unknown=true }
        if (model == 23) { BB ? (CC ? friend=true : foe=true) : unknown=true }

        if (model == 24) { BC ? (AA ? friend=true : foe=true) : unknown=true }
        if (model == 25) { BC ? (AB ? friend=true : foe=true) : unknown=true }
        if (model == 26) { BC ? (AC ? friend=true : foe=true) : unknown=true }
        if (model == 27) { BC ? (BB ? friend=true : foe=true) : unknown=true }
        if (model == 28) { BC ? (BC ? friend=true : foe=true) : unknown=true }
        if (model == 29) { BC ? (CC ? friend=true : foe=true) : unknown=true }

        if (model == 30) { CC ? (AA ? friend=true : foe=true) : unknown=true }
        if (model == 31) { CC ? (AB ? friend=true : foe=true) : unknown=true }
        if (model == 32) { CC ? (AC ? friend=true : foe=true) : unknown=true }
        if (model == 33) { CC ? (BB ? friend=true : foe=true) : unknown=true }
        if (model == 34) { CC ? (BC ? friend=true : foe=true) : unknown=true }
        if (model == 35) { CC ? (CC ? friend=true : foe=true) : unknown=true }

        if (unknown) {
          fitness -= 3;
          this.pool[neighbor.geo.x][neighbor.geo.y].fitness += 3;
        }
        if (foe) {
          fitness -= 1 * polarization
          this.pool[neighbor.geo.x][neighbor.geo.y].fitness -= 1 * polarization;
        }
        if (friend) {
          fitness += 1 * polarization
          this.pool[neighbor.geo.x][neighbor.geo.y].fitness += 1 * polarization;
        }
      }
      
      if (allNeighbors[1].length > 0) { fitness += allNeighbors[1].length + 10; }
      
      if (fitness > fitness_mit && allNeighbors[1].length > 0) {
        let newCell = random(allNeighbors[1]);
        if (newCell){
          offsprings.push(new CreatureX(newCell.geo.x, newCell.geo.y, this.pool[x][y], mutation_rate));
          fitness = Math.floor(fitness/2);
        }
      }
      if (fitness > 255) { fitness = 255; }
      if (fitness < 0) { fitness = 0; }
      if (generation > 40) {fitness = 0;}
      this.pool[x][y].fitness = fitness;
      this.pool[x][y].generation = generation;
    } 
  }

  // Dealing with Offsprings
  if (offsprings.length > 1) {
    offsprings = remove_multiplications(offsprings);
  }
  for (let i = 0; i < offsprings.length; i++) {
    // Only place new offspring if the spot is empty
    if (offsprings[i].fitness > 0 && this.pool[offsprings[i].geo.x][offsprings[i].geo.y].fitness == 0) {
      this.pool[offsprings[i].geo.x][offsprings[i].geo.y] = new CreatureO(offsprings[i].geo.x, offsprings[i].geo.y, offsprings[i].locA, offsprings[i].locB, offsprings[i].locC, offsprings[i].locZ, offsprings[i].fitness, 0);
    } 
    else {
      this.pool[offsprings[i].geo.x][offsprings[i].geo.y].fitness += offsprings[i].fitness;
      if (this.pool[offsprings[i].geo.x][offsprings[i].geo.y].fitness > 255) {
        this.pool[offsprings[i].geo.x][offsprings[i].geo.y].fitness = 255;
      }
    }
  }

  // Fix Fitness Outliers
  for (let x = 0; x < width; x ++) {
    for (let y = 0; y < height; y ++) {
      if (this.pool[x][y].fitness > 255){this.pool[x][y].fitness = 255;}
      if (this.pool[x][y].fitness < 0){this.pool[x][y].fitness = 0;}
    }
  }
}
  
World.prototype.render = function() {
  // Reset the map with current creatures
  background(0);
  for (let x = 0; x < width; x ++) {
    for (let y = 0; y < height; y ++) {
      if (this.pool[x][y].fitness > 0) {
        fill(this.pool[x][y].locA, this.pool[x][y].locB, this.pool[x][y].locC, 128 + Math.floor(this.pool[x][y].fitness/2));
        square(x*steps, y*steps, steps);
      }
    }
  }
}
  
function getNeighbors(pool, x, y) {
  // Returns neighbors, empty cells for the creature at x/y. 
  let neighbors = [];
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

        if (pool[new_x][new_y].fitness > 0) {
          neighbors.push(pool[new_x][new_y]);
        } else {
          empties.push(pool[new_x][new_y]);
        }
      }
    }
  }
  return [neighbors, empties];
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

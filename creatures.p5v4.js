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
let fitness_mit = 140; // fitness cap level for mitosis

// the matches
let distance = 4;   // Max distance of two genes considered similar/opposite
let mut_range = 128;  // Max range of possible mutation away from original value



function setup() {
    let canvas = createCanvas(width*steps, height*steps);
    canvas.parent('WorldOfCreatures');
    startWorld();

    // Add sliders to control while running
    models = createSlider(0, 35, 3);
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
    let WOCCalc = document.getElementById("WOCCalc");
    let WOCRender = document.getElementById("WOCRender");
    const model = models.value();
    const pol = pols.value();
    const mutation_rate = 1/100;
    const crossover_rate = 1/100;

    // Cycling through the map and updating creatures 30 update / render
    var startDateCalc = new Date(); 
    for (let i = 0; i < 30; i++) { 
      world.update(model, pol, mutation_rate, crossover_rate); 
    }
    var endDateCalc   = new Date();

    var startDate = new Date();
    world.render();
    var endDate   = new Date();

    // Reporting
    var species = [];
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
            // loc_e_pop[world.pool[i][j].fitness]++;
            if (world.pool[i][j].fitness > 0) {
                creatures += 1;
                loc_a_pop[world.pool[i][j].locA]++;
                loc_b_pop[world.pool[i][j].locB]++;
                loc_c_pop[world.pool[i][j].locC]++;
                loc_z_pop[world.pool[i][j].locZ]++;
                loc_e_pop[world.pool[i][j].fitness]++;
                var my_gene = world.pool[i][j].locA + '-' + world.pool[i][j].locB + '-' + world.pool[i][j].locC;
                if (typeof species[my_gene] === 'undefined' || !species[my_gene]) {
                    species[my_gene] = 1;
                } else {
                    species[my_gene]++;
                }
            } 
        }
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
    WOCCreatures.innerHTML = creatures;
    WOCCalc.innerHTML = (endDateCalc.getTime() - startDateCalc.getTime());
    WOCRender.innerHTML = (endDate.getTime() - startDate.getTime());

    update_canvas('locA', loc_a_pop, 'rgba(150,0,0,0.9)');
    update_canvas('locB', loc_b_pop, 'rgba(0,150,0,0.9)');   
    update_canvas('locC', loc_c_pop, 'rgba(0,0,150,0.9)');   
    update_canvas('locZ', loc_z_pop, 'rgba(0,0,0,0.9)');
    update_canvas('Energy', loc_e_pop, 'rgba(0,0,0,0.7)');
    if (creatures < 1) { noLoop(); }
}

function update_canvas(gene, frequency, filling) {
    // let max_value = frequency.reduce(function(a, b) { return Math.max(a, b); });
    let max_value = frequency.reduce((a, b) => Math.max(a, b));
    let canvas_gene = document.getElementById(gene+'Canvas').getContext("2d");
    canvas_gene.clearRect(0, 0, 255, 255);
    for (let i = 0; i <= 255; i++) {
        canvas_gene.fillStyle = filling;
        canvas_gene.beginPath();
        canvas_gene.moveTo(i, 100);
        canvas_gene.lineTo(i, 100-Math.ceil(frequency[i]/max_value*100));
        canvas_gene.strokeStyle = filling;
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
    this.pool[width/2][height/2] = new CreatureFix(width/2, height/2);
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
  const newPool = this.pool.map(row => row.map(item => ({...item})));
  const shuffled = shuffledIndexOfArray(newPool)

  let offsprings = [];

  for (const [x, y] of shuffled) {
    if (this.pool[x][y].fitness > 0) {
      let fitness = this.pool[x][y].fitness;
      let generation = this.pool[x][y].generation + 1;
      let allNeighbors = getNeighbors(this.pool, x, y);
      let friends = 0;
      let foes = 0;
      let unknowns = 0;

      // console.log(models[model])
      // value your neighbors
      for (let i = 0; i < allNeighbors[0].length; i++) {
        let neighbor = allNeighbors[0][i];

        let AA = similar(this.pool[x][y].locA, neighbor.locA)
        let AB = similar(this.pool[x][y].locA, neighbor.locB)
        let AC = similar(this.pool[x][y].locA, neighbor.locC)
        let BB = similar(this.pool[x][y].locB, neighbor.locB)
        let BC = similar(this.pool[x][y].locB, neighbor.locC)
        let CC = similar(this.pool[x][y].locC, neighbor.locC)        

        if (model == 0) { AA ? (AA ? friends++ : foes++) : unknowns++ }
        if (model == 1) { AA ? (AB ? friends++ : foes++) : unknowns++ }
        if (model == 2) { AA ? (AC ? friends++ : foes++) : unknowns++ }
        if (model == 3) { AA ? (BB ? friends++ : foes++) : unknowns++ }
        if (model == 4) { AA ? (BC ? friends++ : foes++) : unknowns++ }
        if (model == 5) { AA ? (CC ? friends++ : foes++) : unknowns++ }

        if (model == 6) { AB ? (AA ? friends++ : foes++) : unknowns++ }
        if (model == 7) { AB ? (AB ? friends++ : foes++) : unknowns++ }
        if (model == 8) { AB ? (AC ? friends++ : foes++) : unknowns++ }
        if (model == 9) { AB ? (BB ? friends++ : foes++) : unknowns++ }
        if (model == 10) { AB ? (BC ? friends++ : foes++) : unknowns++ }
        if (model == 11) { AB ? (CC ? friends++ : foes++) : unknowns++ }

        if (model == 12) { AC ? (AA ? friends++ : foes++) : unknowns++ }
        if (model == 13) { AC ? (AB ? friends++ : foes++) : unknowns++ }
        if (model == 14) { AC ? (AC ? friends++ : foes++) : unknowns++ }
        if (model == 15) { AC ? (BB ? friends++ : foes++) : unknowns++ }
        if (model == 16) { AC ? (BC ? friends++ : foes++) : unknowns++ }
        if (model == 17) { AC ? (CC ? friends++ : foes++) : unknowns++ }

        if (model == 18) { BB ? (AA ? friends++ : foes++) : unknowns++ }
        if (model == 19) { BB ? (AB ? friends++ : foes++) : unknowns++ }
        if (model == 20) { BB ? (AC ? friends++ : foes++) : unknowns++ }
        if (model == 21) { BB ? (BB ? friends++ : foes++) : unknowns++ }
        if (model == 22) { BB ? (BC ? friends++ : foes++) : unknowns++ }
        if (model == 23) { BB ? (CC ? friends++ : foes++) : unknowns++ }

        if (model == 24) { BC ? (AA ? friends++ : foes++) : unknowns++ }
        if (model == 25) { BC ? (AB ? friends++ : foes++) : unknowns++ }
        if (model == 26) { BC ? (AC ? friends++ : foes++) : unknowns++ }
        if (model == 27) { BC ? (BB ? friends++ : foes++) : unknowns++ }
        if (model == 28) { BC ? (BC ? friends++ : foes++) : unknowns++ }
        if (model == 29) { BC ? (CC ? friends++ : foes++) : unknowns++ }

        if (model == 30) { CC ? (AA ? friends++ : foes++) : unknowns++ }
        if (model == 31) { CC ? (AB ? friends++ : foes++) : unknowns++ }
        if (model == 33) { CC ? (AC ? friends++ : foes++) : unknowns++ }
        if (model == 33) { CC ? (BB ? friends++ : foes++) : unknowns++ }
        if (model == 34) { CC ? (BC ? friends++ : foes++) : unknowns++ }
        if (model == 35) { CC ? (CC ? friends++ : foes++) : unknowns++ }
      }
      let polarization = (pol == 0) ? 1: -1;
      fitness -= 0;                                                 
      fitness = fitness - unknowns;  
      fitness = fitness + friends * polarization;
      fitness = fitness - foes * polarization;
      fitness = fitness + allNeighbors[1].length;
      
      if (fitness > fitness_mit && allNeighbors[1].length > 0) {
        let newCell = random(allNeighbors[1]);
        if (newCell){
          offsprings.push(new CreatureX(newCell.geo.x, newCell.geo.y, newPool[x][y], mutation_rate));
          fitness = Math.floor(fitness/2);
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
    } 
    else {
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

  for (let x = 0; x < width; x ++) {
    for (let y = 0; y < height; y ++) {
      let cell = this.pool[x][y];
      if (cell.fitness > 0) {
        fill(cell.locA, cell.locB, cell.locC, cell.fitness);
        square(x*steps, y*steps, steps);
      }
    }
  }
}
  
function getNeighbors(pool, x, y) {
  // Returns neighbors, friends, foes and empty cells for the creature at x/y. 
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


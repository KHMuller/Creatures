// Added Meiosis and real crossover

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
    let canvas = createCanvas(width, height);
    canvas.parent('WorldOfCreatures');
    startWorld();

    // Add sliders to control while running
    mutation_rates = createSlider(10, 1000, 100, 10);
    mutation_rates.parent('WOCMutationRates');
    crossover_rates = createSlider(10, 1000, 100, 10);
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
    for (let i = 0; i < 25; i ++) { 
        world.update(model, pol, mutation_rate, crossover_rate); 
    }
    world.render();

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
            if (world.pool[i][j].fitness > 0) {
                creatures += 1;
                loc_a_pop[world.pool[i][j].locA]++;
                loc_b_pop[world.pool[i][j].locB]++;
                loc_c_pop[world.pool[i][j].locC]++;
                loc_z_pop[world.pool[i][j].locZ]++;
                var my_gene = world.pool[i][j].locA + '-' + world.pool[i][j].locB + '-' + world.pool[i][j].locC;
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
    if (creatures < 1) { noLoop(); }
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

function World() {
    this.pool = [];
    for (let x = 0; x < width; x += steps) {
      this.pool[x] = [];
      for (let y = 0; y < height; y += steps) {
        this.pool[x][y] = new CreatureR(x, y);
      }
    }
  }
  
  
  function CreatureR(x, y) {
    // Create a random new creature at indicated position
    this.geo = createVector(x, y);
    this.locA = Math.floor(Math.random() * 256); // Color Red
    this.locB = Math.floor(Math.random() * 256); // Color Green
    this.locC = Math.floor(Math.random() * 256); // Color Blue
    this.locZ = Math.floor(Math.random() * 256); // Not a Color
    this.fitness = Math.floor(Math.random() * 256);
    this.generation = Math.floor(Math.random() * 40);
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
  
  function CreatureX(x, y, parent, mutation_rate, crossover_rate) {
    // Create creature by cell devision (mitosis)
    a = parent.locA;
    b = parent.locB;
    c = parent.locC;
    z = parent.locZ;
    e = Math.floor(parent.fitness / 2);
  
    // Mutation
    let mutation = Math.floor(Math.random() * mutation_rate * 8)
    if (mutation == 0) {
      a += Math.ceil(Math.random() * distance);
      if (a > 255) {
        a -= 256;
      }
    } else if (mutation == 1) {
      a -= Math.ceil(Math.random() * distance);
      if (a < 0) {
        a += 256;
      }
    } else if (mutation == 2) {
      b += Math.ceil(Math.random() * distance);
      if (b > 255) {
        b -= 256;
      }
    } else if (mutation == 3) {
      b -= Math.ceil(Math.random() * distance);
      if (b < 0) {
        b += 256;
      }
    } else if (mutation == 4) {
      c += Math.ceil(Math.random() * distance);
      if (c > 255) {
        c -= 256;
      }
    } else if (mutation == 5) {
      c -= Math.ceil(Math.random() * distance);
      if (c < 0) {
        c += 256;
      }
    } else if (mutation == 6) {
      z -= Math.ceil(Math.random() * distance);
      if (z < 0) {
        z += 256;
      }
    } else if (mutation == 7) {
      z -= Math.ceil(Math.random() * distance);
      if (z < 0) {
        z += 256;
      }
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
  
    // Mutation
    let mutation = Math.floor(Math.random() * mutation_rate * 8)
    if (mutation == 0) {
      a += Math.ceil(Math.random() * distance);
      if (a > 255) {
        a -= 256;
      }
    } else if (mutation == 1) {
      a -= Math.ceil(Math.random() * distance);
      if (a < 0) {
        a += 256;
      }
    } else if (mutation == 2) {
      b += Math.ceil(Math.random() * distance);
      if (b > 255) {
        b -= 256;
      }
    } else if (mutation == 3) {
      b -= Math.ceil(Math.random() * distance);
      if (b < 0) {
        b += 256;
      }
    } else if (mutation == 4) {
      c += Math.ceil(Math.random() * distance);
      if (c > 255) {
        c -= 256;
      }
    } else if (mutation == 5) {
      c -= Math.ceil(Math.random() * distance);
      if (c < 0) {
        c += 256;
      }
    } else if (mutation == 6) {
      z -= Math.ceil(Math.random() * distance);
      if (z < 0) {
        z += 256;
      }
    } else if (mutation == 7) {
      z -= Math.ceil(Math.random() * distance);
      if (z < 0) {
        z += 256;
      }
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
              if (offsprings[i].geo.x == offsprings[j].geo.x && offsprings[i].geo.y == offsprings[j].geo.y) {
                if (Math.floor(Math.random() * 2 == 0)) {
                  offsprings[i].fitness = 0;
                } else {
                  offsprings[j].fitness = 0;
                }              
              }
          }
      }
      return offsprings;
  }
  
  World.prototype.update = function(model, pol, mutation_rate, crossover_rate) {
    let newPool = [];
    let offsprings = [];
    let polarization = 1;
    for (let x = 0; x < width; x += steps) {
      newPool[x] = [];
      for (let y = 0; y < height; y += steps) {
        let currentCreature = new CreatureO(this.pool[x][y].geo.x, this.pool[x][y].geo.y, this.pool[x][y].locA, this.pool[x][y].locB, this.pool[x][y].locC, this.pool[x][y].locZ, this.pool[x][y].fitness, this.pool[x][y].generation);
        newPool[x][y] = currentCreature;
      }
    }
    for (let k = 0; k < 1000; k++) {
        let x = Math.floor(Math.random() * width / steps) * steps;
        let y = Math.floor(Math.random() * height / steps) * steps;
    // }
    // for (let x = 0; x < width; x += steps) {
    //   for (let y = 0; y < height; y += steps) {
        if (this.pool[x][y].fitness > 0) {
          let fitness = this.pool[x][y].fitness;
          let generation = this.pool[x][y].generation;
          let allNeighbours = getNeighbours(this.pool, x, y, model);

          if (pol == 1) { polarization = -1; }
          fitness = fitness + (4 - allNeighbours[0].length);
          fitness = fitness + allNeighbours[1].length * polarization;
          fitness = fitness + allNeighbours[2].length * polarization * (-1);          

        //   fitness = fitness + (4 - allNeighbours[0].length);
        //   fitness = fitness + allNeighbours[1].length;
        //   fitness = fitness + allNeighbours[2].length * (-1);
          if (fitness > fitness_mit) {
            if (allNeighbours[3].length > 0) {
              let newCell = random(allNeighbours[3]);
              fitness = Math.floor(fitness/2);
              if (allNeighbours[2].length > 0) {
                // Meiosis
                let partner = random(allNeighbours[2]);
                offsprings.push(new CreatureM(newCell.geo.x, newCell.geo.y, this.pool[x][y], partner, mutation_rate, crossover_rate));
              } else {
                // Mitosis
                offsprings.push(new CreatureX(newCell.geo.x, newCell.geo.y, this.pool[x][y], mutation_rate, crossover_rate));
              }
            }
          }
          if (fitness > fitness_max) {
            fitness = fitness_max;
          }
          generation++;
          if (generation > 40) {fitness = 0;}
          newPool[x][y].fitness = fitness;
          newPool[x][y].generation = generation;
        }
      }
    // }
    if (offsprings.length > 1) {
      offsprings = remove_multiplications(offsprings);
    }
    for (let i = 0; i < offsprings.length; i++) {
      if (offsprings[i].fitness > 0) {
        newPool[offsprings[i].geo.x][offsprings[i].geo.y] = new CreatureO(offsprings[i].geo.x, offsprings[i].geo.y, offsprings[i].locA, offsprings[i].locB, offsprings[i].locC, offsprings[i].locZ, offsprings[i].fitness, 0);
      }
    }
    this.pool = newPool; // copy back?
  }
  
  World.prototype.render = function() {
    // Model defines colors to show
    background(129);
    let red = 0;
    let green = 0;
    let blue = 0;
    let opacity = 0;
  
    for (let x = 0; x < width; x += steps) {
      for (let y = 0; y < height; y += steps) {
        let cell = this.pool[x][y];
        red = cell.locA;
        green = cell.locB;
        blue = cell.locC;
        opacity = 128 + Math.floor(cell.fitness / 2);
        if (cell.fitness > 0) {
          fill(red, green, blue, opacity);
          stroke(0);
          square(x, y, steps);
        } else {
          fill(256);
          stroke(0);
          square(x, y, steps);
        }
      }
    }
  }
  
  
  function getNeighbours(pool, x, y, model) {
    // Returns neighbours, friends and foes for the creature at x/y. 
    let neighbours = [];
    let friends = [];
    let foes = [];
    let empties = [];
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i == 0 && j == 0) {} else {
          let new_x = x + i * steps;
          let new_y = y + j * steps;
          
          if (new_x >= 0 && new_x < width && new_y >= 0 && new_y < height) {     
            if (pool[new_x][new_y].fitness > 0) {
              neighbours.push(pool[new_x][new_y]);
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
          }
        }
      }
    }
    return [neighbours, friends, foes, empties];
  }
  
  function selectAllele(allele1, allele2) {
    // Returns one of two alleles at 50% chance
    if (Math.floor(Math.random() * 2 == 0)) {
      return allele1;
    } else {
      return allele2;
    }
  }
  
  
  function similar(allele1, allele2) {
    let gap = Math.abs(allele2 - allele1);
    if (255 - gap < gap) {
      gap = 255 - gap;
    }
    let slope = Math.floor(Math.random() * distance * 2);
    if (gap < slope) {
      return true;
    } else {
      return false;
    }
  }
  
  function opposite(allele1, allele2) {
    let gap = Math.abs(allele2 - allele1);
    if (255 - gap < gap) {
      gap = 255 - gap;
    }
    gap = 128 - gap; // apply opposite
    let slope = Math.floor(Math.random() * distance * 2);
    if (gap < slope) {
      return true;
    } else {
      return false;
    }
  }

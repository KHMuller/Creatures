# Creatures
A simulation of natural selection of a virtual 4-gene organism undergoing mutations and crossover.

The latest version can be seen here: https://www.simaec.net/creatures/p5jsv2/

An organism has 4 different genes used to view neighbors and to identify them as ally or rival. There are different models implemented to determine if a creature can see its neighbors:

- A creature can always see its neigbours
- Perception of a neighbour is determined by one gene serving as ligand and receptor (locA vs locA')
- Perception of a neighbour is determined by one gene serving as ligand docking with another gene of the neighbour (locA vs locB')
- Perception of a neighbour is determined by one gene serving as ligand docking with another gene of the neighbour (locA vs locC')

In all cases, locC determines if a seen neighbour is an ally or rival.

With a mutation or crossover an offspring suddenly may not be seen by its neighbours anymore and/or stop being able to see its neighbours. It may also turn it and/or them from ally to rival or vice versa.

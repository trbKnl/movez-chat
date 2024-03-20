import { Combination } from 'js-combinatorics'
import { unpack, pack }  from 'msgpackr'


// GAME OBJECT

export class Game {
    constructor(
      players = [],
      allPairs = null,
      imposter = null,
      gameOngoing = true,
      round = null, 
      currentRound = 0
    ) {

    if (allPairs === null) {
      let combinations = new Combination(players, 2);
      allPairs = [...combinations]
    }

    if (imposter === null) {
      imposter = players[Math.floor(Math.random() * players.length)];
    }

    // Initialize class properties
    this.players = players
    this.allPairs = allPairs
    this.imposter = imposter
    this.gameOngoing = gameOngoing
    this.round = round
    this.currentRound = currentRound
    this.duration = 100000
  }

  getRound() {
    return this.round
  }

  nextRound() {
    let currentPlayers = []
    this.round = []

    if (this.allPairs.length === 0) {
      this.gameOngoing = false
      return
    }
    for (let i = 0; i < this.allPairs.length; i++) {
      const pair = this.allPairs[i];
      const player1 =  pair[0]
      const player2 =  pair[1]
      if (!currentPlayers.includes(player1) && !currentPlayers.includes(player2)) {
        this.round.push(pair)
        currentPlayers.push(player1, player2)
        this.allPairs.splice(i, 1)
        i--
      }
    }
    this.currentRound += 1
  }

  static createFromObject(game) {
    const{ players, allPairs, imposter, gameOngoing, round, currentRound } = game
    return new Game( players, allPairs, imposter, gameOngoing, round, currentRound )
  }
}


const SESSION_TTL = 24 * 60 * 60;

export class GameStore {
  constructor(redisClient) {
    this.redisClient = redisClient;
  }

  async load(id) {
    let game = await this.redisClient.hgetBuffer(`game:${id}`, "game")
    if (game !== null) {
      let gameObject = unpack(game)
      game = Game.createFromObject(gameObject)
    }
    return game
  }

  async save(id, game) {
    await this.redisClient.multi().hset(
        `game:${id}`,
        "game",
        pack(game),
      )
      .expire(`game:${id}`, SESSION_TTL)
      .exec();
  }
}


//new Game(["a", "b", "c", "d"])
//
//
//var asd = new Game(["a", "b", "c", "d"])
//
//let store = new GameStore(redisClient)
//await store.save(1, asd)
//var check = await store.load(1)
//check
//
//var check = await store.load(2)
//check
//
//var test = Game.createFromObject(asd)
//test
//test.nextRound()
//test.startGame()
//test.nextRound()
//test.getRound()
//
//console.log(pack(asd))
//unpack(pack(asd))
//
//



const CARDS = [
    "Message 1",
    "Message 2",
    "Message 3",
    "Message 4",
    "Message 5",
    "Message 6",
    "Message 7",
    "Message 8",
    "Message 9",
    "Message 10",
]

const startCard = "Click to start the game"
const endCard = "Game is finished, click if you want to restart the game"

function popRandomElement(array) {
    if (array.length === 0) {
      return undefined
    }
    const randomIndex = Math.floor(Math.random() * array.length);
    return array.splice(randomIndex, 1)[0];
}


export class CardGame  {
  constructor(
      card = startCard,
      cardsLeft = [...CARDS].reverse(),
      totalNumberOfCards = CARDS.length,
      progress = 0,
  ) {
    this.card = card
    this.cardsLeft = cardsLeft
    this.totalNumberOfCards = totalNumberOfCards
    this.progress = progress
  }

  get currentCard() {
    return this.card
  }

  nextCard(mode = "random") {
    let card
    if (this.card === endCard) {
      this.reset()
    }
    if (mode === "random") {
      card = popRandomElement(this.cardsLeft)
    } else if (mode === "linear") {
      card = this.cardsLeft.pop()
    } else {
      card = this.cardsLeft.pop()
    }
    this.card = card || endCard
    this.currentProgress()
    return this.card
  }

  currentProgress() {
    this.progress = (this.totalNumberOfCards - this.cardsLeft.length) / this.totalNumberOfCards * 100 
    return this.progress
  }

  isOngoing() {
    return this.currentProgress() !== 100
  }

  reset() {
    this.card = startCard
    this.cardsLeft = [...CARDS].reverse() // make a copy of the CARD array
    this.totalNumberOfCards = CARDS.length
    this.progress = 0
  }

  serialize() {
    return JSON.stringify(this)
  }

  static createFromSerialized(serializedCardGame) {
    const {card, cardsLeft, totalNumberOfCards, progress} = JSON.parse(serializedCardGame)
    return new CardGame(card, cardsLeft, totalNumberOfCards, progress)
  }
}



//var game = new CardGame()
//
//game.currentCard()
//game.nextCard()
//game.currentProgress()
//console.log(CARDS)
//
////
//game.nextRandomCard()
//
//var a = ["a", "b", "c"]
//popRandomElement(a)
//
//
//function asd(x = "asd") {
//  console.log(x)
//}
//
//asd("Asd")
//asd()
//
//
//

//var game2 = new CardGame()
//
//game2.nextCard(mode = "linear")
//game2.currentProgress()
//game2.resetGame()
//
//var game2_serialized = game2.serialize()
//game2_serialized
//
//var new_game = CardGame.createFromSerialized(game2_serialized)
//new_game.nextCard()
//
//CARDS
//
//
//
//

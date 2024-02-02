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

export class CardGame  {
  constructor() {
    this.card = "blank"
    this.playedCards = []
    this.cardsLeft = CARDS.reverse()
    this.totalNumberOfCards = CARDS.length
    this.progress = 0
  }

  currentCard() {
    return this.card
  }

  nextCard() {
    const card = this.cardsLeft.pop()
    // game ongoing
    if (card !== undefined) {
      this.card = card
      this.playedCards.push(card)
    // run out of cards
    } else {
      this.card = "blank"
    }
    return this.card
  }

  currentProgress() {
    this.progress = this.playedCards.length / this.totalNumberOfCards * 100 
    return this.progress
  }

}


// var game = new CardGame()
// game.currentCard()
// game.nextCard()
// game.currentProgress()

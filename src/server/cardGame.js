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
const endCard = "Game is finished, click if you want to restart the game 🎉"

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
      users = [],
  ) {
    this.card = card
    this.cardsLeft = cardsLeft
    this.totalNumberOfCards = totalNumberOfCards
    this.progress = progress
    this.users = users
  }

  get currentCard() {
    return this.card
  }

  nextCard(mode = "random") {
    let card
    if (mode === "random") {
      card = popRandomElement(this.cardsLeft)
    } else if (mode === "linear") {
      card = this.cardsLeft.pop()
    } else {
      card = this.cardsLeft.pop()
    }
    this.card = card
    if (this.card === undefined) {
      this.reset()
    }
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
    this.card = endCard
    this.cardsLeft = [...CARDS].reverse() // make a copy of the CARD array
    this.totalNumberOfCards = CARDS.length
    this.progress = 0
    this.users = this.users
  }

  registerUser(user) {
    console.log(`CARDGAME ${JSON.stringify(this.users)}`)
    if (this.users.includes(user) === false) {
      this.users.push(user)
    } 
  }

  isValidUser(user) {
    if (this.users.includes(user)) {
      return true
    } else if (this.users.length < 2) {
      return true
    } else {
      false
    }
  }

  serialize() {
    return JSON.stringify(this)
  }

  static createFromSerialized(serializedCardGame) {
    const {card, cardsLeft, totalNumberOfCards, progress, users} = JSON.parse(serializedCardGame)
    return new CardGame(card, cardsLeft, totalNumberOfCards, progress, users)
  }
}

const countLetters = (word: string) => {
  return [...word].reduce((pop, letter) => {
    if (!pop[letter]) {
      pop[letter] = 1
    } else {
      pop[letter]++
    }
    return pop
  }, {}) as { [key: string]: number }
}

export class WordList {
  words: string[]
  letters = 'enlivened'
  mustContain = 'v'
  minLength = 4
  reuseLetters = true
  filterCount = 0

  constructor(words) {
    this.words = words
  }

  get list() {
    if (!this.letters) {
      this.filterCount = 0
      return []
    }
    let filtered = this.words.filter((word) => word.length >= this.minLength)
    if (this.mustContain) {
      filtered = filtered.filter((word) =>
        word.includes(this.mustContain.toLocaleLowerCase())
      )
    }
    if (this.letters) {
      const regex = new RegExp(`^[${this.letters.toLocaleLowerCase()}]+$`)
      if (this.reuseLetters) {
        filtered = filtered.filter((word) => regex.test(word))
      } else {
        const maxCounts = countLetters(this.letters.toLocaleLowerCase())
        filtered = filtered.filter((word) => {
          if (!regex.test(word)) {
            return false
          }
          const letterCounts = countLetters(word)
          return !Object.keys(letterCounts).find(
            (letter) => letterCounts[letter] > maxCounts[letter]
          )
        })
      }
    }
    this.filterCount = filtered.length
    return filtered
  }

  get wordCount() {
    return this.words.length
  }
}

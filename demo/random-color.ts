export const randomColor = (): string =>
  `hsl(${Math.floor(Math.random() * 360)} ${
    Math.floor(Math.random() * 4 + 1) * 25
  }% 50%)`

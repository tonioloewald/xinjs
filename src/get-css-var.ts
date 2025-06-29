export function getCssVar(
  variableName: string,
  atElement = document.body
): string {
  const computedStyle = getComputedStyle(atElement)
  if (variableName.endsWith(')') && variableName.startsWith('var(')) {
    variableName = variableName.slice(4, -1)
  }
  return computedStyle.getPropertyValue(variableName).trim()
}

/**
 * @return {string} colorHex
 */
export const getRandomColor = () => {
  const letters = '0123456789ABCDEF'
  let color = '#'

  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }

  return color
}

/**
 * Create user id from users name
 *
 * @param {string} username
 *
 * @return {number} userId
 */
export const hash = (username) => {
  let hash = 0

  if (username.length === 0) {
    return hash
  }

  for (let i = 0; i < username.length; i++) {
    const char = username.charCodeAt(i)

    hash = (hash << 5) - hash + char
    hash = hash & hash
  }

  return hash
}

/**
 * Create cursor container element to hold username and cursor bar,
 * to display others users where the specified user is positioned
 *
 * @param {number} boundingTop - bounding rect top
 * @param {number} boundingLeft - bounding rect left
 * @param {number} offsetTop - offsetTop
 * @param {number} scrollTop - scrollTop
 * @param {number} userId - user ID
 *
 * @return {HTMLDivElement} HTMLDivElement
 */
export const createCursorElement = (boundingTop, boundingLeft, offsetTop, scrollTop, userId) => {
  const cursor = document.createElement('div')
  cursor.id = `cursor-${userId}`
  cursor.style.position = 'absolute'
  cursor.style.zIndex = 1

  if (boundingTop === 0) {
    cursor.style.top = `${offsetTop}px`
    cursor.style.left = '1em'
  } else {
    cursor.style.top = `${scrollTop + boundingTop}px`
    cursor.style.left = `${boundingLeft}px`
  }

  return cursor
}

/**
 * Create cursor bar element to display position of the cursor
 *
 * @param {number} height - bounding rect height
 * @param {string} color - hex color
 *
 * @return {HTMLDivElement} HTMLDivElement
 */
export const createCursorBarElement = (height, color) => {
  const cursorBar = document.createElement('div')
  cursorBar.style.opacity = 0.85
  cursorBar.style.width = '2px'
  cursorBar.style.position = 'relative'
  cursorBar.style.height = height ? `${height}px` : '1em'
  cursorBar.style.backgroundColor = color

  return cursorBar
}

/**
 * Create cursor bar element to display position of the cursor
 *
 * @param {string} username
 * @param {string} color - hex color
 *
 * @return {HTMLSpanElement} HTMLSpanElement
 */
export const createCursorTextElement = (username, color) => {
  const cursorText = document.createElement('span')
  cursorText.textContent = username
  cursorText.style.color = '#fff'
  cursorText.style.fontSize = '10px'
  cursorText.style.height = '12px'
  cursorText.style.position = 'absolute'
  cursorText.style.top = '-12px'
  cursorText.style.backgroundColor = color

  return cursorText
}

/**
 * Create selection container element to hold username,
 * to display others users what text user has selected
 *
 * @param {number} userId - bounding rect top
 * @param {string} color - hex color
 * @param {Position} position - Ranges position - width, height, y, x
 * @param {number} scrollTop - scrollTop
 *
 * @return {HTMLSpanElement} HTMLSpanElement
 */
export const createSelectionElement = (userId, color, { width, height, y, x }, scrollTop) => {
  const selection = document.createElement('span')
  selection.id = `selection-${userId}`
  selection.style.backgroundColor = color
  selection.style.opacity = 0.5
  selection.style.position = 'absolute'
  selection.style.width = width + 'px'
  selection.style.height = height + 'px'
  selection.style.top = y + scrollTop + 'px'
  selection.style.left = x + 'px'
  selection.style.zIndex = 1

  return selection
}

/**
 * Create selection text element to display username of the user which has selected text
 *
 * @param {string} username
 * @param {string} color - hex color
 *
 * @return {HTMLSpanElement} HTMLSpanElement
 */
export const createSelectionTextElement = (username, color) => {
  const selectionText = document.createElement('span')
  selectionText.textContent = username
  selectionText.style.color = '#fff'
  selectionText.style.fontSize = '10px'
  selectionText.style.height = '12px'
  selectionText.style.position = 'absolute'
  selectionText.style.top = '-12px'
  selectionText.style.backgroundColor = color

  return selectionText
}



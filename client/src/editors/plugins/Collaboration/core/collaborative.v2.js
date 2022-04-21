import {
  // Create cursor elements
  createCursorElement,
  createCursorBarElement,
  createCursorTextElement,

  // Create selection elements
  createSelectionElement,
  createSelectionTextElement,

  // helper functions
  getRandomColor,
  hash,
} from './collaborative.utils'

const CollaborativeEditing = (function () {
  /**
   * Constructor
   *
   * @param {Editor} editor - TinyMCE editor instance
   * @param {User} user - User who started document editing
   * @param {string} socketURL - Socket URL to connect to
   */
  function CollaborativeEditing(editor, user, socketURL) {
    const _this = this
    this.$editor = editor

    this.cursors = new Map()
    this.selections = new Map()
    this.colors = new Map()

    this.user = user
    this.clients = new Set()

    this.io = require('socket.io-client')
    this.$sockets = this.io.connect(socketURL)

    /*
      Handle user connection
    */
    this.$sockets.on('connect', () => {
      _this.$sockets.emit('client_connected', _this.user)
    })

    this.$sockets.on('update_clients', this.onUpdateClients.bind(this))
    this.$sockets.on('update_content', this.onUpdateContent.bind(this))
    this.$sockets.on('update_cursor', this.onUpdateCursor.bind(this))
    this.$sockets.on('update_selection', this.onUpdateSelection.bind(this))
  }

  /**
   * Socket Event Listener : Update clients for other users when new joins
   *
   * @param {array} clients - Clients who joined document editing
   */
  CollaborativeEditing.prototype.onUpdateClients = function (clients = []) {
    const users = new Map(clients)

    users.forEach((value, key) => {
      if (this.user && this.user.name !== value.name && !this.clients.has(key)) {
        this.clients.add(key)
        this.setUser(value)
      }
    })
  }

  /**
   * Socket Event Listener : Update content for other users online
   *
   * @param {Message} message
   */
  CollaborativeEditing.prototype.onUpdateContent = function (message) {
    this.$editor.setContent(message.content)
  }

  /**
   * Socket Event Listener : Update user cursor for other users online
   *
   * @param {object} obj - Contains user, range, startIndex and textContent
   */
  CollaborativeEditing.prototype.onUpdateCursor = function (obj) {
    const { user, range, startIndex, content } = JSON.parse(obj)

    this.deleteUserInteractions(user)

    const appendRange = new Range()
    const node = this.$editor.getDoc().querySelector('.mce-content-body').children[startIndex]

    if (node) {
      const textNode = this.findTextNode(node, content)
      let offset = 0

      if (range.endOffset > textNode.textContent.length) {
        offset++
      }

      appendRange.setStart(textNode, range.startOffset - offset)
      appendRange.setEnd(textNode, range.endOffset - offset)

      this.moveCursor(node, appendRange, user)
    }
  }

  /**
   * Socket Event Listener : Update user selection for other users online
   *
   * @param {object} obj - Contains user, range, startIndex, endIndex, startContent, endContent
   */
  CollaborativeEditing.prototype.onUpdateSelection = function (obj) {
    const { user, range, startIndex, endIndex, startContent, endContent } = JSON.parse(obj)

    this.deleteUserInteractions(user)

    const appendRange = new Range()
    const startNode = this.$editor.getDoc().querySelector('.mce-content-body').children[startIndex]
    const endNode = this.$editor.getDoc().querySelector('.mce-content-body').children[endIndex]

    const startTextContent = this.findTextNode(startNode, startContent)

    if (!startTextContent) {
      return
    }

    let endTextContent = this.findTextNode(endNode, endContent)

    if (!endTextContent) {
      endTextContent = startTextContent
    }

    let startOffset = 0
    let endOffset = 0

    if (range.startOffset > startTextContent.length) {
      startOffset++
    }
    if (range.endOffset > endTextContent.length) {
      endOffset++
    }

    appendRange.setStart(startTextContent, range.startOffset - startOffset)
    appendRange.setEnd(endTextContent, range.endOffset - endOffset)

    this.selections.set(this.hash(user.name), {
      range: appendRange,
      user
    })
    this.moveSelection(Array.from(appendRange.getClientRects()), user)
  }

  /**
   * Create user container, set its main color
   *
   * @param {User} user
   */
  CollaborativeEditing.prototype.setUser = function (user) {
    const container = document.createElement('div')
    container.classList.add('user-container')

    // Create avatar
    const avatar = document.createElement('span')
    avatar.innerText = user.name

    // Append avatar
    container.appendChild(avatar)

    const userContainer = document
      .querySelector(this.$editor.getParam('selector'))
      .parentElement.querySelector('#user-container')

    userContainer.appendChild(container)

    this.colors.set(user.name, this.getRandomColor())
  }

  CollaborativeEditing.prototype.updateContent = function () {
    this.$sockets.emit('set_content', {
      username: this.user.name,
      content: this.$editor.getContent()
    })
    this.onResize()
  }

  CollaborativeEditing.prototype.onResize = function () {
    this.cursors.forEach((cursor, key) => {
      const { range, node } = cursor
      const doc = this.$editor.getDoc()
      const element = doc.querySelector(`#cursor-${key}`)

      if (element) {
        const bounding = range.getBoundingClientRect()
        const scrollTop = doc.children[0]

        if (bounding.top) {
          element.style.top = `${node.offsetTop}px`
          element.style.left = '1em'
        } else {
          element.style.top = `${scrollTop + bounding.top}px`
          element.style.left = `${bounding.left}px`
        }
      }
    })

    this.selections.forEach((selection) => {
      const { range, user } = selection

      this.deleteUserInteractions(user)
      this.moveSelection(Array.from(range.getClientRects()), user)
    })
  }

  CollaborativeEditing.prototype.onEvent = function (event, user) {
    const selection = this.$editor.getDoc().getSelection()

    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const hasTextSelected = range.startOffset !== range.endOffset

      let startNode = range.startContainer

      while (startNode.parentElement && startNode.parentElement.id !== 'tinymce') {
        startNode = startNode.parentElement
      }

      let siblingNode = startNode.previousSibling
      let startIndex = 0

      while (siblingNode !== null) {
        siblingNode = siblingNode.previousSibling
        startIndex++
      }

      this.deleteUserInteractions(user)

      if (hasTextSelected) {
        let endNode = range.endContainer
        let endIndex = 0

        while (endNode.parentElement && endNode.parentElement.id !== 'tinymce') {
          endNode = endNode.parentElement
        }

        siblingNode = endNode.previousSibling
        while (siblingNode !== null) {
          siblingNode = siblingNode.previousSibling
          endIndex++
        }

        this.$sockets.emit(
          'set_selection',
          JSON.stringify({
            range: {
              startOffset: range.startOffset,
              endOffset: range.endOffset
            },
            startIndex,
            endIndex,
            startContent: range.startContainer.textContent,
            endContent: range.endContainer.textContent,
            user
          })
        )
      } else {
        this.$sockets.emit(
          'set_cursor',
          JSON.stringify({
            range: {
              startOffset: range.startOffset,
              endOffset: range.endOffset
            },
            user,
            startIndex,
            content: range.startContainer.textContent
          })
        )
      }
    }
  }

  CollaborativeEditing.prototype.moveCursor = function (node, range, user) {
    const userId = this.hash(user.name)
    const bounding = range.getBoundingClientRect()

    const color = this.colors.get(user.name)

    const cursor = createCursorElement(
      bounding.top,
      bounding.left,
      node.offsetTop,
      this.$editor.getDoc().children[0].scrollTop,
      userId
    )
    const cursorBar = createCursorBarElement(bounding.height, color)
    const cursorText = createCursorTextElement(user.name, color)

    cursorBar.appendChild(cursorText)
    cursor.append(cursorBar)

    const body = this.$editor.getDoc().body
    body.parentElement.insertBefore(cursor, body)

    this.cursors.set(userId, { range, node })
    this.selections.delete(userId)
  }

  CollaborativeEditing.prototype.moveSelection = function (ranges, user) {
    const body = this.$editor.getDoc().body
    const userId = this.hash(user.name)
    const color = this.colors.get(user.name)

    for (let i = 0; i < ranges.length; i++) {
      const scrollTop = this.$editor.getBody().parentElement.scrollTop
      const selection = createSelectionElement(
        userId,
        color,
        {
          width: ranges[i].width,
          height: ranges[i].height,
          x: ranges[i].x,
          y: ranges[i].y,
        },
        scrollTop
      )

      if (i === 0) {
        const selectionText = createSelectionTextElement(user.name, color)
        selection.appendChild(selectionText)
      }

      body.parentElement.insertBefore(selection, body)
    }

    this.cursors.delete(userId)
  }

  CollaborativeEditing.prototype.findTextNode = function (node, content) {
    let textNode

    if (node.textContent.trim().indexOf(content.trim()) > -1 && node.childNodes.length === 0) {
      return node
    }

    const childNodes = Array.from(node.childNodes)

    for (let i = 0; i < childNodes.length; i++) {
      const currentNode = childNodes[i]

      if (currentNode.textContent.trim().indexOf(content.trim()) > -1 && currentNode.childNodes.length === 0) {
        return currentNode
      }

      textNode = this.findTextNode(currentNode, content)

      if (textNode) {
        return textNode
      }
    }

    return textNode
  }

  CollaborativeEditing.prototype.deleteUserInteractions = function (user) {
    if (!user) {
      return
    }

    const userId = this.hash(user.name)

    const cursor = this.$editor.getDoc().querySelector(`#cursor-${userId}`)

    if (cursor) {
      cursor.remove()
    }

    const selections = this.$editor.getDoc().querySelectorAll(`#selection-${userId}`)

    if (selections && selections.length > 0) {
      selections.forEach((selection) => selection.remove())
    }
  }

  /**
   * Create user ID to set for cursors/selections
   *
   * @param {string} username
   *
   * @return {number} userId - hashed username
   */
  CollaborativeEditing.prototype.hash = hash

  /**
   * Get random color for user
   * This color will be set and used to show other users when collaborating on same document
   *
   * @return {string} color - hex color - #XXXXXX
   */
  CollaborativeEditing.prototype.getRandomColor = getRandomColor

  return CollaborativeEditing
})()

export { CollaborativeEditing }

import { CollaborativeEditing } from './core/collaborative.v2'

const collaborativeMap = new Map()

const Collaboration = (editor) => {
  let myUser = undefined

  editor.on('Load', () => {
    // Loaded
    const { user, socketURL } = JSON.parse(JSON.stringify(editor.getParam('collaboration')))
    const userEditor = new CollaborativeEditing(editor, user, socketURL)

    userEditor.setUser(user)
    myUser = user

    collaborativeMap.set(editor.getParam('selector'), userEditor)

    window.onresize = function () {
      userEditor.onResize()
    }
  })

  editor.on('click', (event) => {
    collaborativeMap.get(editor.getParam('selector')).onEvent(event, myUser)
  })
  editor.on('input', (event) => {
    callback(event)
  })
  editor.on('NewBlock', (event) => {
    callback(event)
  })
  editor.on('FormatApply', (event) => {
    callback(event)
  })
  editor.on('FormatRemove', (event) => {
    callback(event)
  })
  editor.on('paste', (event) => {
    setTimeout(() => {
      callback(event)
    }, 25)
  })

  /**
   * Callback function for most events
   *
   * Will get user editor, and update the content and cursor/selection
   */
  const callback = (event) => {
    const userEditor = collaborativeMap.get(editor.getParam('selector'))
    if (userEditor) {
      userEditor.updateContent(event)
      userEditor.onEvent(event, myUser)
    }
  }
}

export default Collaboration

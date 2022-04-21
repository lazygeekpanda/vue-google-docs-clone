// const DEFAULT_DPI = 72
// A4 page size
const PAGE_SIZE = {
  width: 595,
  height: 1123
}

const AutoPageBreak = (function () {
  function AutoPageBreak (editor) {
    this.$editor = editor
    this.body = {
      initialized: false,

      padding: {},
      margin: {},

      documentHeight: PAGE_SIZE.height
    }
    this.pageBreaks = []


  }

  AutoPageBreak.prototype.setProperties = function () {
    const target = this.$editor.getDoc().querySelector('.mce-content-body')
    // const rect = target.getBoundingClientRect()
    const styles = window.getComputedStyle(target, null)

    const margin = {
      top: Number(styles.getPropertyValue('margin-top').slice(0, -2)),
      bottom: Number(styles.getPropertyValue('margin-bottom').slice(0, -2))
    }
    const padding = {
      top: Number(styles.getPropertyValue('padding-top').slice(0, -2)),
      bottom: Number(styles.getPropertyValue('padding-bottom').slice(0, -2))
    }

    // const documentHeight = rect.height - margin.top + padding.top + padding.bottom - 100
    // console.log(margin, padding, documentHeight)
    this.body = {
      initialized: true,

      margin,
      padding,
      // documentHeight
    }
  }

  AutoPageBreak.prototype.onInput = function (/* event */) {
    // console.log('AutoPageBreak onInput listener', event)

    if (!this.body.initialized) {
      this.setProperties()
    }

    const doc = this.$editor.getDoc()

    const target = doc.querySelector('.mce-content-body')
    const rect = target.getBoundingClientRect()

    const selection = doc.getSelection()
    const currentNode = selection.baseNode.nodeType === 1 ? selection.baseNode : selection.baseNode.parentElement
    // const currentNodeRect = currentNode.getBoundingClientRect()

    console.log(selection, currentNode.offsetTop)

    const { margin, padding } = this.body
    // const styles = window.getComputedStyle(target, null)

    // const fullRectHeight = rect.height
    // const margin = {
    //   top: Number(styles.getPropertyValue('margin-top').slice(0, -2)),
    //   bottom: Number(styles.getPropertyValue('margin-bottom').slice(0, -2))
    // }
    // const padding = {
    //   top: Number(styles.getPropertyValue('padding-top').slice(0, -2)),
    //   bottom: Number(styles.getPropertyValue('padding-bottom').slice(0, -2))
    // }
    const documentHeight = rect.height - margin.top + padding.top + padding.bottom - 100

    if (documentHeight >= PAGE_SIZE.height && this.pageBreaks.length === 0) {
      const id = this.pageBreaks.length + 1
      // const pageBreak = document.createElement('div')
      // pageBreak.id = 'page-break-' + id
      // pageBreak.style.breakAfter = 'always'
      // pageBreak.style.marginTop = padding.top
      // pageBreak.style.marginBottom = padding.bottom
      // pageBreak.style.backgroundColor = '#f4f4f4'
      // pageBreak.style.width = '100%'
      // pageBreak.style.height = '10px'
      // pageBreak.style.position = 'absolute'
      // pageBreak.style.top = currentNode.offsetTop + currentNodeRect.height + 20  + 'px'
      // pageBreak.style.left = 0
      // // pageBreak.style['page-break-after'] = 'always'

      // doc.body.insertBefore(pageBreak, currentNode)
      this.$editor.insertContent(`
      <div id="page-break-${id}"
        class='mceNonEditable'
        style="padding-top: ${padding.top}px;padding-bottom: ${padding.bottom}px; height: 10px; position: relative;">
        <div class='mceNonEditable' style="page-break-after: always; position: absolute; top: 0; bottom: 0; left: -100px; right: -100px; background-color: #f4f4f4;"></div>
      </div>
      `)

      this.pageBreaks.push('page-break-' + id)
    }
  }

  return AutoPageBreak
})()

export { AutoPageBreak }
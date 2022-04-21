import { AutoPageBreak as AutoPageBreakCore } from './core/auto_page_break'

const AutoPageBreak = (editor) => {
  const autoPageBreak = new AutoPageBreakCore(editor)

  editor.on('Load', () => {
    console.log('Loaded AutoPageBreak')
  })

  editor.on('input', (event) => {
    autoPageBreak.onInput(event)
  })
  editor.on('NewBlock', (event) => {
    console.log(event)
    autoPageBreak.onInput(event)
  })

  let domHtml
  let lastPageBreaks = []

  function refreshRuler() {
    try {
      domHtml = editor.getDoc().getElementsByTagName('HTML')[0]
    } catch (e) {
      return setTimeout(refreshRuler, 50)
    }

    const dpi = 96
    const cm = dpi / 2.54
    const a4px = cm * (29.7 - 2) // A4 height in px, -5.5 are my additional margins in my PDF print

    // ruler begins (in px)
    const startMargin = 0

    const domHtmlHeight = domHtml.getBoundingClientRect().height

    // max size (in px) = document size + extra to be sure, idk, the height is too small for some reason
    const imgH = domHtmlHeight + a4px * 5

    const pageBreakHeight = 14 // height of the pagebreak line in tinyMce

    const pageBreaks = []
    domHtml.querySelectorAll('.mce-pagebreak').forEach(function (node) {
      pageBreaks[pageBreaks.length] = node.offsetTop
    })
    pageBreaks.sort()

    // if pageBreak is too close next page, then ignore it

    if (lastPageBreaks == pageBreaks) {
      return // no change
    }
    lastPageBreaks = pageBreaks

    var s = ''
    s += '<svg width="100%" height="' + imgH + '" xmlns="http://www.w3.org/2000/svg">'

    s += '<style>'
    s += '.pageNumber{font-weight:bold;font-size:14px;font-family:verdana;color: #000;}'
    s += '</style>'

    const pages = Math.ceil(imgH / a4px)

    let curY = startMargin

    for (let i = 0; i < pages; i++) {
      let blockH = a4px
      let isPageBreak = 0

      for (let j = 0; j < pageBreaks.length; j++) {
        if (pageBreaks[j] < curY + blockH) {
          blockH = pageBreaks[j] - curY
          isPageBreak = 1
          pageBreaks.splice(j, 1)
        }
      }

      s += '<text x="10" y="' + (curY + 19 + 5) + '" class="pageNumber" fill="#000">Page ' + (i + 1) + '.</text>'

      curY += blockH
      if (isPageBreak) {
        //s+= '<rect x="0" y="'+curY+'" width="100%" height="'+pageBreakHeight+'" fill="#FFFFFF" />';
        curY += pageBreakHeight
      }
    }

    s += '</svg>'

    domHtml.style.backgroundImage = 'url("data:image/svg+xml;utf8,' + encodeURIComponent(s) + '")'
  }
  editor.on('NodeChange', refreshRuler)
  editor.on('init', refreshRuler)
}

export default AutoPageBreak

import { debounce } from 'lodash'

const CLASS_RULER = "document-ruler"
const RULER_PAGEBREAK_CLASS = "mce-ruler-pagebreak"
const RULER_SHORTCUT = "Meta+Q"
const PX_RULER = 3.78 // 3.779527559
const PADDING_RULER = 13 // in millimeters
const FORMAT = { width: 210, height: 297 } // A4 210, 297
const HEIGHT = FORMAT.height * PX_RULER
const STYLE_RULER = `
 html.${CLASS_RULER}{
   background: #f4f4f4;
   padding: 0;
   background-image: url(data:image/svg+xml;utf8,%3Csvg%20width%3D%22100%25%22%20height%3D%22${
     FORMAT.height
   }mm%22%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cline%20x1%3D%220%22%20y1%3D%22${
  FORMAT.height
}mm%22%20x2%3D%22100%25%22%20y2%3D%22${
  FORMAT.height
}mm%22%20stroke%3D%22%23${"737373"}%22%20height%3D%221px%22%2F%3E%3C%2Fsvg%3E);
   background-repeat: repeat-y;
   background-position: 0 0;
 }
 html.${CLASS_RULER} body{
   padding: 0 ${PADDING_RULER}mm !important;
   padding-top: ${PADDING_RULER}mm !important;
   margin: 0 auto !important;
   background-image: url(data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22${
     FORMAT.width
   }mm%22%20height%3D%22${FORMAT.height}mm%22%3E%3Crect%20width%3D%22${
  FORMAT.width
}mm%22%20height%3D%22${
  FORMAT.height
}mm%22%20style%3D%22fill%3A%23fff%22%2F%3E%3Cline%20x1%3D%220%22%20y1%3D%22100%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%20stroke%3D%22%23737373%22%20height%3D%221px%22%2F%3E%3Cline%20x1%3D%22${PADDING_RULER}mm%22%20y1%3D%220%22%20x2%3D%22${PADDING_RULER}mm%22%20y2%3D%22100%25%22%20stroke%3D%22%230168e1%22%20height%3D%221px%22%20stroke-dasharray%3D%225%2C5%22%2F%3E%3Cline%20x1%3D%22${
  FORMAT.width - PADDING_RULER
}mm%22%20y1%3D%220%22%20x2%3D%22${
  FORMAT.width - PADDING_RULER
}mm%22%20y2%3D%22100%25%22%20stroke%3D%22%230168e1%22%20height%3D%221px%22%20stroke-dasharray%3D%225%2C5%22%2F%3E%3Cline%20x1%3D%220%22%20y1%3D%22${PADDING_RULER}mm%22%20x2%3D%22100%25%22%20y2%3D%22${PADDING_RULER}mm%22%20stroke%3D%22%230168e1%22%20height%3D%221px%22%20stroke-dasharray%3D%225%2C5%22%2F%3E%3Cline%20x1%3D%220%22%20y1%3D%22${
  FORMAT.height - PADDING_RULER
}mm%22%20x2%3D%22100%25%22%20y2%3D%22${
  FORMAT.height - PADDING_RULER
}mm%22%20stroke%3D%22%230168e1%22%20height%3D%221px%22%20stroke-dasharray%3D%225%2C5%22%2F%3E%3C%2Fsvg%3E);
   background-repeat: repeat-y;
   background-position: 0 0;
   width: ${FORMAT.width}mm;
   min-height: ${FORMAT.height}mm !important;
   box-sizing: border-box;
   box-shadow: 0 0 4px rgba(0, 0, 0, 0.15);

 }
 html.${CLASS_RULER} .${RULER_PAGEBREAK_CLASS}{
   margin-top: ${PADDING_RULER}mm;
   margin-bottom: ${PADDING_RULER}mm;
   margin-left: -${PADDING_RULER}mm;
   width: calc(100% + ${2 * PADDING_RULER}mm);
   border: 0;
   height: 1px;
   background: #5a8ecb;
 }

 @media print {
   @page {
     size: ${FORMAT.width}mm ${FORMAT.height}mm;
     margin: ${PADDING_RULER}mm !important;
     counter-increment: page
   }
   html.${CLASS_RULER}, html.${CLASS_RULER} body {
     background: transparent;
     box-shadow: none
   }
   html.${CLASS_RULER} body {
     padding: 0 !important;
     width: 100%;
     font-size: 13px;
     font-family: Helvetica,Arial,sans-serif !important;
     font-style: normal;
     letter-spacing: 0
   }
   html.${CLASS_RULER} .${RULER_PAGEBREAK_CLASS}{
     margin: 0 !important;
     height: 0 !important
   }
 }
`


function createStyle(style, doc) {
  const tag = doc.createElement("style")
  tag.innerHTML = style
  doc.head.appendChild(tag)
}

const RulerPlugin = (editor) => {
  if (editor.settings.ruler !== true) {
    return void 0
  }
  const tinyEnv = window.tinymce.util.Tools.resolve("tinymce.Env")

  const FilterContent = {
    getPageBreakClass() {
      return RULER_PAGEBREAK_CLASS
    },
    getPlaceholderHtml() {
      return (
        '<img src="' +
        tinyEnv.transparentSrc +
        '" class="' +
        this.getPageBreakClass() +
        '" data-mce-resize="false" data-mce-placeholder style="page-break-before: always; clear:both" />'
      )
    },
  }

  const Settings = {
    getSeparatorHtml() {
      return editor.getParam("pagebreak_separator", "<!-- ruler-pagebreak -->") // <!-- pagebreak -->
    },
    shouldSplitBlock() {
      return editor.getParam("pagebreak_split_block", false)
    },
  }

  const separatorHtml = Settings.getSeparatorHtml(editor)
  var pageBreakSeparatorRegExp = new RegExp(
    separatorHtml.replace(/[\?\.\*\[\]\(\)\{\}\+\^\$\:]/g, function (a) {// eslint-disable-line no-useless-escape
      return "\\" + a
    }),
    "gi"
  )
  editor.on("BeforeSetContent", function (e) {
    e.content = e.content.replace(
      pageBreakSeparatorRegExp,
      FilterContent.getPlaceholderHtml()
    )
  })
  editor.on("PreInit", function () {
    editor.serializer.addNodeFilter("img", function (nodes) {
      var i = nodes.length,
        node,
        className
      while (i--) {
        node = nodes[i]
        className = node.attr("class")
        if (
          className &&
          className.indexOf(FilterContent.getPageBreakClass()) !== -1
        ) {
          const parentNode = node.parent
          if (
            editor.schema.getBlockElements()[parentNode.name] &&
            Settings.shouldSplitBlock(editor)
          ) {
            parentNode.type = 3
            parentNode.value = separatorHtml
            parentNode.raw = true
            node.remove()
            continue
          }
          node.type = 3
          node.value = separatorHtml
          node.raw = true
        }
      }
    })
  })

  editor.on("ResolveName", function (e) {
    if (
      e.target.nodeName === "IMG" &&
      editor.dom.hasClass(e.target, FilterContent.getPageBreakClass())
    ) {
      e.name = "pagebreak"
    }
  })

  editor.addCommand("mceRulerPageBreak", function () {
    if (editor.settings.pagebreak_split_block) {
      editor.insertContent("<p>" + FilterContent.getPlaceholderHtml() + "</p>")
    } else {
      editor.insertContent(FilterContent.getPlaceholderHtml())
    }
  })

  editor.addCommand("mceRulerRecalculate", function () {
    const $document = editor.getDoc()
    const $breaks = $document.querySelectorAll(`.${RULER_PAGEBREAK_CLASS}`)
    for (let i = 0; i < $breaks.length; i++) {
      const $element = $breaks[i]
      const $parent = $element.parentElement
      const offsetTop = $element.offsetTop
      const top = HEIGHT * (i + 1)
      if (top >= offsetTop) {
        $parent.style.marginTop =
          ~~(top - (offsetTop - $parent.style.marginTop.replace("px", ""))) +
          "px"
      }
    }
  })

  editor.addShortcut(RULER_SHORTCUT, "", "mceRulerPageBreak")

  editor.on("init", () => {
    const $document = editor.getDoc()
    createStyle(STYLE_RULER, $document)
    const documentElement = $document.documentElement
    const hasRuler = documentElement.classList.contains(CLASS_RULER)

    // editor.execCommand('mceRulerPageBreak')

    if (hasRuler === false) {
      documentElement.classList.add(CLASS_RULER)
    }
  })

  const recalculate = debounce(() => {
    editor.execCommand("mceRulerRecalculate")
  }, 100)

  editor.on("NodeChange", () => {
    recalculate()
  })

  editor.on('ResizeWindow', () => {
    recalculate()
  })
}

export default RulerPlugin

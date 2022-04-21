import CollaborativeEditing from '../plugins/Collaboration'
import Ruler from '../plugins/Ruler'
import AutoPageBreak from '../plugins/AutoPageBreak'

export const setupPlugins = function () {
  window.tinymce.PluginManager.add('collaboration', CollaborativeEditing)
  window.tinymce.PluginManager.add('autoPageBreak', AutoPageBreak)
  window.tinymce.PluginManager.add('ruler', Ruler)
}

export const config = {
  menubar: true,
  ruler: true,
  plugins: [
    'toc advlist autolink lists link image imagetools charmap print preview anchor textpattern',
    'searchreplace visualblocks code fullscreen',
    'insertdatetime media table paste code help wordcount',
    'visualblocks autosave codesample directionality emoticons',
    'hr nonbreaking quickbars save fullscreen lineheight',
    'noneditable',
    'collaboration',
    "ruler",
    'autoPageBreak pagebreak'
  ],
  toolbar:
    'undo redo print toc | \
     formatselect | fontselect fontsizeselect  bold italic underline forecolor backcolor  | \
     link image | \
     lineheight | alignleft aligncenter alignright alignjustify | lineheightselect | \
     bullist numlist outdent indent | removeformat | ',
  autosave_ask_before_unload: true,
  pagebreak_split_block: true
}

export default { config: config, plugins: setupPlugins }

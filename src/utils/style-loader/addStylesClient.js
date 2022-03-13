// https://github.com/vuejs/vue-style-loader/blob/master/lib/addStylesClient.js
/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Modified by Evan You @yyx990803
*/
import { listToStyles } from './listToStyles'

const hasDocument = typeof document !== 'undefined'

/*
type StyleObject = {
  id: number;
  parts: Array<StyleObjectPart>
}
type StyleObjectPart = {
  css: string;
  media: string;
  sourceMap: ?string
}
*/

const stylesInDom = {
  /*
  [id: number]: {
    id: number,
    refs: number,
    parts: Array<(obj?: StyleObjectPart) => void>
  }
*/
}

const head
  = hasDocument && (document.head || document.getElementsByTagName('head')[0])

let isProduction = false
const noop = function() {}
let options = null
const ssrIdKey = 'data-vcv-id'

export function addStylesClient(parentId, list, _isProduction, _options) {
  isProduction = _isProduction

  options = _options || { ssrId: true }

  let styles = listToStyles(parentId, list)
  addStylesToDom(styles)

  return function update(newList) {
    const mayRemove = []
    for (let i = 0; i < styles.length; i++) {
      const item = styles[i]
      const domStyle = stylesInDom[item.id]
      domStyle.refs--
      mayRemove.push(domStyle)
    }
    if (newList) {
      styles = listToStyles(parentId, newList)
      addStylesToDom(styles)
    }
    else {
      styles = []
    }
    // eslint-disable-next-line no-redeclare
    for (let i = 0; i < mayRemove.length; i++) {
      // eslint-disable-next-line no-redeclare
      const domStyle = mayRemove[i]
      if (domStyle.refs === 0) {
        for (let j = 0; j < domStyle.parts.length; j++) {
          // 调用 remove
          domStyle.parts[j]()
        }
        delete stylesInDom[domStyle.id]
      }
    }
  }
}
/**
 * 添加 Style 至 DOM 中
 */
function addStylesToDom(styles /* Array<StyleObject> */) {
  for (let i = 0; i < styles.length; i++) {
    const item = styles[i]
    const domStyle = stylesInDom[item.id]
    if (domStyle) {
      domStyle.refs++
      // 内容发生变更 覆盖原有节点
      for (let j = 0; j < domStyle.parts.length; j++)
        domStyle.parts[j](item.parts[j])

      // 新增 Style 节点
      for (let j = 0; j < item.parts.length; j++)
        domStyle.parts.push(addStyle(item.parts[j]))

      // style 节点长度保持最新 丢弃多余内容
      if (domStyle.parts.length > item.parts.length)
        domStyle.parts.length = item.parts.length
    }
    else {
      const parts = []
      // eslint-disable-next-line no-redeclare
      for (let j = 0; j < item.parts.length; j++)
        parts.push(addStyle(item.parts[j]))

      stylesInDom[item.id] = { id: item.id, refs: 1, parts }
    }
  }
}

function createStyleElement() {
  const styleElement = document.createElement('style')
  styleElement.type = 'text/css'
  head.appendChild(styleElement)
  return styleElement
}

function addStyle(obj /* StyleObjectPart */) {
  let styleElement = document.querySelector(
    `style[${ssrIdKey}~="${obj.id}"]`,
  )

  if (styleElement) {
    if (isProduction) {
      // has SSR styles and in production mode.
      // simply do nothing.
      return noop
    }
    else {
      // has SSR styles but in dev mode.
      // for some reason Chrome can't handle source map in server-rendered
      // style tags - source maps in <style> only works if the style tag is
      // created and inserted dynamically. So we remove the server rendered
      // styles and inject new ones.
      styleElement.parentNode.removeChild(styleElement)
    }
  }

  // OldIE 暂不支持
  // use multi-style-tag mode in all other cases
  styleElement = createStyleElement()
  const update = applyToTag.bind(null, styleElement)
  const remove = function() {
    styleElement.parentNode.removeChild(styleElement)
  }

  update(obj)

  return function updateStyle(newObj /* StyleObjectPart */) {
    if (newObj) {
      // CSS是否发生变化
      if (newObj.css === obj.css)
        return

      // 变化更新内容
      update((obj = newObj))
    }
    else {
      // 移除该节点
      remove()
    }
  }
}

function applyToTag(styleElement, obj) {
  const css = obj.css
  if (options.ssrId)
    styleElement.setAttribute(ssrIdKey, obj.id)

  // let media = obj.media;
  // let sourceMap = obj.sourceMap;
  // if (media) {}
  // if (sourceMap) {}

  // if (styleElement.styleSheet) {
  if (styleElement.type === 'text/css') {
    // styleElement.styleSheet.cssText = css;
    styleElement.innerHTML = css
  }
  else {
    // while (styleElement.firstChild) {
    //   styleElement.removeChild(styleElement.firstChild);
    // }
    // styleElement.appendChild(document.createTextNode(css));
  }
}

// github.com/vuejs/vue-style-loader/blob/master/lib/listToStyles.js
/**
 * Translates the list format produced by css-loader into something
 * easier to manipulate.
 */

export function listToStyles(parentId, list) {
  const styles = []
  const newStyles = {}
  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    const id = parentId // item[0];
    const content = item.content
    const css = item.css
    // var media = item[2];
    // var sourceMap = item[3];
    const part = {
      id: `${parentId}:${i}`,
      content,
      css,
      //   media: media,
      //   sourceMap: sourceMap,
    }
    if (!newStyles[id])
      styles.push((newStyles[id] = { id, parts: [part] }))
    else
      newStyles[id].parts.push(part)
  }
  return styles
}

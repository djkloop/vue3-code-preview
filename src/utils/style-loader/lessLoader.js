export default async function lessLoader(source) {
  const lessOptions = {}
  let result
  try {
    const resolvedImplementation = require('less')
    result = await resolvedImplementation.render(source, lessOptions)
  }
  catch (error) {
    return
  }

  return result
}

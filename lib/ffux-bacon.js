const Bacon       = require("baconjs"),
      ffuxFactory = require("./ffux")

const {zipObject, noop} = require("./util")

const ffux = ffuxFactory(subscribe, composeStateP, createAction, checkStateStream)
export default ffux


function composeStateP(stateModelProps) {
  const template = zipObject(stateModelProps)
  return Bacon.combineTemplate(template)

}

function subscribe(stateP, actions, callback) {
  const usubValue = stateP.onValue(state => callback({state, actions})),
        usubError = stateP.onError(error => { throw error })

  return () => {
    usubValue()
    usubError()
  }
}

function createAction() {
  const bus = new Bacon.Bus()
  return {
    stream: bus.map(noop),
    fn: (...args) => {
      if (args.length === 1) {
        bus.push(args[0])
      } else {
        bus.push(args)
      }
    }
  }
}

function checkStateStream(stream) {
  try {
    stream.toProperty(1)
  } catch (ignore) {
    return stream
  }
  throw new Error("Store's state stream must be a Bacon.Property with initial value")
}

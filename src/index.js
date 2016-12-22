const rf = require('redux-form')
const reduxFormPropTypes = rf.reduxFormPropTypes
const getFormValues = rf.getFormValues
const getFormSyncErrors = rf.getFormSyncErrors
const getFormSubmitErrors = rf.getFormSubmitErrors

/* istanbul ignore next */
const _getState = function _getState (formName, state) {
  return {
    values: getFormValues(formName)(state),
    syncErrors: getFormSyncErrors(formName)(state),
    submitErrors: getFormSubmitErrors(formName)(state)
  }
}

/**
 * redux-formify a component.   wraps the component such that form state gets
 * injected into props, and such that `<Field>`s connect to their associated
 * datas in the store.  This method is a replacement for default `reduxForm`
 * call due to bugs with accessing form state.  It also keeps Component's a wee
 * bit tidier, given the nastyness in double wrapping the component export. This
 * method should be removed IFF 2299 is addressed and provides a simple API to
 * get all form state directly into the wrapped Component.
 * {@link https://github.com/erikras/redux-form/issues/2299}
 * @export
 * @param {any} { component: Component, formName, [connect] }
 * @returns {Component}
 */
const mod = {
  _reduxForm: rf.reduxForm,
  connect: null,
  _getState: _getState,
  reduxifyForm: function (opts) {
    if (!opts) throw new Error('please provide object with component & formName')
    const { component, formName } = opts
    if (!component) throw new Error('must provide component')
    if (!formName || typeof formName !== 'string') throw new Error('must string formName')
    const connect = opts.connect || this.connect
    if (!connect) throw new Error('please `init(connect)` or provide `.connect` to your opts')
    component.propTypes = Object.assign(component.propTypes || {}, reduxFormPropTypes)
    const RFComponent = this._reduxForm({ form: formName })(component)
    /* istanbul ignore next */
    return connect(
      function getFormState (state) {
        return {
          formState: opts.getState ? opts.getState(formName, state) : this._getState(formName, state)
        }
      }.bind(this)
    )(RFComponent)
  },
  init: function init (connect) {
    this.connect = connect
  }
}

for (let prop in mod) {
  if (typeof mod[prop] === 'function') {
    mod[prop] = mod[prop].bind(mod)
  }
}

module.exports = mod

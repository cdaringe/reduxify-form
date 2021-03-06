# reduxify-form

Improve redux-form api to give your connected form all of the state it needs! :penguin:

[ ![Codeship Status for cdaringe/reduxify-form](https://app.codeship.com/projects/6093c460-a555-0134-848d-3e884ad29ec0/status?branch=master)](https://app.codeship.com/projects/190842)
[![Coverage Status](https://coveralls.io/repos/github/cdaringe/reduxify-form/badge.svg?branch=master)](https://coveralls.io/github/cdaringe/reduxify-form?branch=master) ![](https://img.shields.io/badge/standardjs-%E2%9C%93-brightgreen.svg) [![Greenkeeper badge](https://badges.greenkeeper.io/cdaringe/reduxify-form.svg)](https://greenkeeper.io/)


## why

the [redux-form]() API has some quirks. your `reduxForm(...)`'ed component isn't passed all of the form state you need.

For example:

- by default, you can't see all of your validation errors, or form values in the root component (see [#2299](https://github.com/erikras/redux-form/issues/2299))
- when you want to get _extra_ props into your reduxForm'd component, you end up doing some double wrapping/connecting of your exports.  it's a little wonky!

this package makes setting up your form easier to get all the rich form state you need!

## usage

`npm install --save reduxify-form`

consider the [example of how redux-form recommends getting extra state into your form](http://redux-form.com/6.3.1/examples/selectingFormValues/).

```jsx
// redux-form provided example, simplified/condensed

// boring old imports
import React from 'react'
import { connect } from 'react-redux'
import { Field, reduxForm, formValueSelector } from 'redux-form'

// boring old form component
let MyForm = (props) => {
  const { firstName, handleSubmit } = props
  return (
    <form onSubmit={handleSubmit}>
      <Field name="firstName" component="input" type="text" placeholder="First Name"/>
      <input value={`You've typed: ${firstName}`} />
      <Field name="lastName" component="input" type="text" placeholder="Last Name"/>
    </form>
  )
}

// connect redux-form to our component for the first time...
MyForm = reduxForm({
  form: 'myForm'
})(MyForm)

// connect our component again to get some additional state
MyForm = connect(
  state => {
    const firstName = formValueSelector('myForm')(state, 'firstName')
    return { firstName }
  }
)(MyForm)

export default MyForm
```

ok, that's not too bad!  unforunately, not all selectors _work_.  see [#2299](https://github.com/erikras/redux-form/issues/2299).  further, this could be a little bit friendlier! let's examine how `reduxify-form` helps.

```jsx
// reduxify-form example

// one extra import!
import React from 'react'
import { Field } from 'redux-form'
import { connect } from 'react-redux'
import { reduxifyForm } from 'reduxify-form' // <== this guy :)

let MyForm = (props) => {
  // note where we get our additional state from now
  const { formState: { firstName }, handleSubmit } = props
  return (
    <form onSubmit={handleSubmit}>
      <Field name="firstName" component="input" type="text" placeholder="First Name"/>
      <input value={`You've typed: ${firstName.value}`} />
      <Field name="lastName" component="input" type="text" placeholder="Last Name"/>
    </form>
  )
}

// wait, and this is it?
// yup!  just one call to get all of that additional state (like field values, such as firstName)
export default reduxifyForm({
  component: MyForm,
  formName: 'myform',
  connect
})

```

## api

#### reduxifyForm({ component: Component, formName, [connect], [getState] }) : Component

```jsx
export default reduxifyForm({
  component: MyForm,
  formName: 'myform'
})
```

by default, behaves similarly to [reduxForm](http://redux-form.com/6.3.1/docs/api/ReduxForm.md/) whilst applying **additional** form state to your `props`.

addtional `props` come through as `props.formState`.  what is exactly in `formState`, you ask? content from redux-form state selectors.

```js
// selectors are from http://redux-form.com/6.3.1/docs/api/ReduxForm.md/
props.formState = {
  values: getFormValues(formName)(state),
  syncErrors: getFormSyncErrors(formName)(state),
  submitErrors: getFormSubmitErrors(formName)(state)
}
```

**want different content in `formState`?**  no problem.  pass a custom function via `getState`.

```js
export default reduxifyForm({
  component: MyForm,
  formName: 'myform'
  getState: function (formName, state) {
    // return any selectors from redux form
    return {
      dirty: isDirty(formName)(state),
      pristine: isPristine(formName)(state),
      invalid: isInvalid(formName)(state),
      myFieldValue: formValueSelector(formName)(state, 'myField'),
      fruit: 'bananas'
    }
  }
})
```

#### init(connect) : undefined

rather than passing `connect` on every form call, you can bind `reduxify-form` to `connect` just once, so it works with all of your forms.

```jsx
import { connect } from 'react-redux'
import { reduxifyForm, init } from 'reduxify-form'
init(connect)

// now you don't need to provided `connect` to any reduxifyForm calls
export default reduxifyForm({
  component: MyForm,
  formName: 'myform',
  connect
})
```


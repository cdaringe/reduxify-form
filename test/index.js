'use strict'

const tape = require('tape')
const rify = require('../')
const sinon = require('sinon')

// totally hilarious tests!
tape('lib', t => {
  const component = {}
  t.throws(() => rify.reduxifyForm())
  t.throws(() => rify.reduxifyForm({ component: {} })) // no formName
  t.throws(() => rify.reduxifyForm({ formName: 'blah' })) // no component
  t.throws(() => rify.reduxifyForm({ component: {}, formName: 'blah' })) // no connect
  t.notOk(rify.connect)
  rify.init(i => i => component)
  t.ok(rify.connect, 'connect set')
  sinon.stub(rify, '_getState', () => ({ testField: 'testField' }))
  sinon.stub(rify, '_reduxForm', i => j => component)
  const newComponent = rify.reduxifyForm({ component, formName: 'test' })
  t.ok(component === newComponent)
  t.end()
})

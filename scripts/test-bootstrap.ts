import { JSDOM } from 'jsdom'
import {
  ensureBootstrapInFrame,
  BOOTSTRAP_SCRIPT_ID,
  BOOTSTRAP_SCRIPT_URL
} from '../src/components/grapesjs/custom-components/bootstrap5-components'

const run = async () => {
  const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>', {
    url: 'http://localhost'
  })
  const { window } = dom
  const document = window.document

  const ensurePromise = ensureBootstrapInFrame(document, window)
  const scriptEl = document.getElementById(BOOTSTRAP_SCRIPT_ID) as HTMLScriptElement | null
  if (!scriptEl) {
    throw new Error('Bootstrap script element was not injected')
  }
  if (!scriptEl.src.endsWith(BOOTSTRAP_SCRIPT_URL)) {
    throw new Error(`Unexpected bootstrap script src: ${scriptEl.src}`)
  }

  window.bootstrap = {
    Carousel: class {},
    Collapse: class {}
  }
  scriptEl.dispatchEvent(new window.Event('load'))

  const bootstrap = await ensurePromise
  if (!bootstrap || !bootstrap.Carousel) {
    throw new Error('Bootstrap did not resolve after script load')
  }

  const second = await ensureBootstrapInFrame(document, window)
  if (document.querySelectorAll(`#${BOOTSTRAP_SCRIPT_ID}`).length !== 1) {
    throw new Error('Bootstrap script element duplicated')
  }
  if (second !== bootstrap) {
    throw new Error('Bootstrap result not memoized')
  }

  console.log('Bootstrap ensure test passed')
}

run().catch((error) => {
  console.error('Bootstrap ensure test failed:', error)
  process.exitCode = 1
})

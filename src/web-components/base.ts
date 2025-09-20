"use client"

import { createRoot, Root } from 'react-dom/client'
import React from 'react'

export type ReactWC<Props> = {
  setProps: (props: Props) => void
  disconnect: () => void
}

export function defineReactWebComponent<Props>(
  tag: string,
  Component: React.ComponentType<Props>,
  options?: { styles?: string }
): void {
  if (typeof window === 'undefined') return
  if (customElements.get(tag)) return

  class ReactElement extends HTMLElement {
    private root: Root | null = null
    private currentProps: Props | any
    private shadow: ShadowRoot

    constructor() {
      super()
      this.shadow = this.attachShadow({ mode: 'open' })
      if (options?.styles) {
        const style = document.createElement('style')
        style.textContent = options.styles
        this.shadow.appendChild(style)
      }
      const mount = document.createElement('div')
      mount.setAttribute('data-mount', 'true')
      this.shadow.appendChild(mount)
      this.root = createRoot(mount)
    }

    static get observedAttributes() { return ['data-props'] }

    connectedCallback() {
      this.render()
    }

    disconnectedCallback() {
      if (this.root) {
        this.root.unmount()
      }
    }

    set props(p: Props) {
      this.currentProps = p
      this.render()
    }

    attributeChangedCallback(name: string, _old: string | null, value: string | null) {
      if (name === 'data-props') {
        try {
          const parsed = value ? JSON.parse(value) : undefined
          if (parsed) {
            this.currentProps = parsed
            this.render()
          }
        } catch { /* ignore */ }
      }
    }

    private render() {
      if (!this.root) return
      this.root.render(React.createElement(Component, this.currentProps))
    }
  }

  customElements.define(tag, ReactElement)
}

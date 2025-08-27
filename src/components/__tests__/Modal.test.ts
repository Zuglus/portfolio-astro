import { describe, it, expect } from 'vitest'
import { parseAstroHTML } from '../../test/astro-utils'
import modalSource from '../Modal.astro?raw'
import sliderSource from '../Slider.astro?raw'

function getMarkup(source: string) {
  const parts = source.split('---')
  return parts.length > 2 ? parts[2] : parts[1]
}

describe('Modal component', () => {
  it('contains dialog role and close button', () => {
    const html = getMarkup(modalSource)
    const doc = parseAstroHTML(html)
    const dialog = doc.querySelector('div[role="dialog"]')
    expect(dialog).toBeTruthy()
    expect(dialog?.getAttribute('x-on:click.self')).toContain(
      'unlockBodyScroll',
    )
    const close = doc.querySelector('button[aria-label="Закрыть"]')
    expect(close).toBeTruthy()
    expect(close?.getAttribute('x-on:click')).toContain('unlockBodyScroll')
  })
})

describe('Slider component', () => {
  it('has navigation buttons', () => {
    const html = getMarkup(sliderSource)
    const doc = parseAstroHTML(html)
    expect(
      doc.querySelector('button[aria-label="Предыдущий слайд"]'),
    ).toBeTruthy()
    expect(
      doc.querySelector('button[aria-label="Следующий слайд"]'),
    ).toBeTruthy()
  })
})

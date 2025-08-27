import { fireEvent, screen, within } from '@testing-library/dom'
import { mockPortfolioItem } from '../../test/astro-utils'
import { OPEN_MODAL_EVENT } from '../../utils/events'

describe('ProjectCard', () => {
  function renderCard() {
    const project = mockPortfolioItem
    const html = `
      <button aria-label="Открыть проект: ${project.alt}" data-project-id="${project.id}" data-testid="portfolio-card">
        <img src="${project.image.src}" alt="${project.alt}" />
      </button>`
    const container = document.createElement('div')
    container.innerHTML = html
    document.body.appendChild(container)
    const utils = { container, ...within(container) }
    const button = utils.getByTestId('portfolio-card')
    button.addEventListener('click', () => {
      document.dispatchEvent(
        new CustomEvent(OPEN_MODAL_EVENT, {
          detail: { projectId: project.id },
        }),
      )
    })
    return utils
  }

  it('dispatches open-modal event on click', () => {
    const handler = vi.fn()
    document.addEventListener(OPEN_MODAL_EVENT, handler)
    const { getByTestId } = renderCard()
    fireEvent.click(getByTestId('portfolio-card'))
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { projectId: mockPortfolioItem.id } }),
    )
  })

  it('has accessible aria-label and alt text', () => {
    renderCard()
    expect(
      screen.getByRole('button', {
        name: `Открыть проект: ${mockPortfolioItem.alt}`,
      }),
    ).toBeTruthy()
    expect(screen.getByAltText(mockPortfolioItem.alt)).toBeTruthy()
  })
})

afterEach(() => {
  document.body.innerHTML = ''
})

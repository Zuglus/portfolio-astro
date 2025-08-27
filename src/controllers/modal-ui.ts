export function updateCloseHint() {
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  const hintElement = document.getElementById('close-hint')
  if (hintElement) {
    hintElement.textContent = isTouchDevice
      ? 'тап для закрытия'
      : 'ESC или клик для закрытия'
  }
}

export function initModalUI(nextTick: (cb: () => void) => void) {
  nextTick(updateCloseHint)
}

export function lockBodyScroll() {
  document.body.style.overflow = 'hidden'
}

export function unlockBodyScroll() {
  document.body.style.overflow = ''
}

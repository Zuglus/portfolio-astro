declare global {
  interface Window {
    Alpine: any
  }
}

declare module 'alpinejs' {
  const Alpine: any
  export default Alpine
}

export {}

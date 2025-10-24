import { projects } from '../data/projects'

/* global Alpine */

document.addEventListener('alpine:init', () => {
  Alpine.store('projects', structuredClone(projects))
})

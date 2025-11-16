'use client'

import { useEffect } from 'react'

export default function DisableGrammarly() {
  useEffect(() => {
    // Disable Grammarly on all input elements in the app
    const disableGrammarly = () => {
      // Add data attributes to disable Grammarly
      document.querySelectorAll('input, textarea, [contenteditable]').forEach(element => {
        element.setAttribute('data-gramm', 'false')
        element.setAttribute('data-gramm_editor', 'false')
        element.setAttribute('data-enable-grammarly', 'false')
      })
    }

    // Run immediately
    disableGrammarly()

    // Also run when DOM changes (for dynamically added elements)
    const observer = new MutationObserver(disableGrammarly)
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    return () => observer.disconnect()
  }, [])

  return null
}
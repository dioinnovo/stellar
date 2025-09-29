'use client'

import { useEffect, useState } from 'react'

export default function PresentationTestPage() {
  const [slideCount, setSlideCount] = useState(0)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slideContent, setSlideContent] = useState<string[]>([])

  useEffect(() => {
    // Test the presentation by checking all slides
    const checkSlides = () => {
      const iframe = document.getElementById('presentation-frame') as HTMLIFrameElement
      if (iframe && iframe.contentDocument) {
        const slides = iframe.contentDocument.querySelectorAll('.slide')
        setSlideCount(slides.length)

        const contents: string[] = []
        slides.forEach((slide, index) => {
          const header = slide.querySelector('h2')?.textContent || slide.querySelector('h1')?.textContent || 'No title'
          contents.push(`Slide ${index + 1}: ${header}`)
        })
        setSlideContent(contents)
      }
    }

    // Wait for iframe to load
    setTimeout(checkSlides, 2000)
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Presentation Test</h1>

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 mb-4">
          <h2 className="text-xl font-semibold mb-2">Slide Audit Results</h2>
          <p className="text-lg mb-2">Total Slides Found: <span className="font-bold text-green-600">{slideCount}</span></p>

          {slideContent.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Slide Titles:</h3>
              <ul className="space-y-1">
                {slideContent.map((content, index) => (
                  <li key={index} className="text-sm p-2 bg-gray-50 dark:bg-gray-900 rounded">
                    {content}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-4">Presentation Preview</h2>
          <iframe
            id="presentation-frame"
            src="/presentation.html"
            className="w-full h-[600px] border-2 border-gray-300 dark:border-gray-600 rounded"
            title="Presentation Test"
          />
        </div>
      </div>
    </div>
  )
}
"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import * as pdfjsLib from "pdfjs-dist"
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Highlighter,
  Minus,
  MousePointer2,
  Pencil,
  Plus,
  Printer,
  Redo2,
  Save,
  Search,
  Shapes,
  Sidebar,
  Type,
  Undo2,
} from "lucide-react"
import { Button } from "@/components/ui/button"

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString()

const PDF_URL = "/contract-final.pdf"

type PDFDoc = any

type Thumbnail = {
  pageNumber: number
  dataUrl: string
}

function PdfPageCanvas({
  pdf,
  pageNumber,
  scale,
}: {
  pdf: PDFDoc
  pageNumber: number
  scale: number
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isRendering, setIsRendering] = useState(false)

  useEffect(() => {
    let cancelled = false
    let renderTask: any = null

    const renderPage = async () => {
      try {
        setIsRendering(true)

        const page = await pdf.getPage(pageNumber)
        if (cancelled) return

        const viewport = page.getViewport({ scale })
        const canvas = canvasRef.current
        if (!canvas) return

        const context = canvas.getContext("2d")
        if (!context) return

        const outputScale = window.devicePixelRatio || 1

        canvas.width = Math.floor(viewport.width * outputScale)
        canvas.height = Math.floor(viewport.height * outputScale)
        canvas.style.width = `${viewport.width}px`
        canvas.style.height = `${viewport.height}px`

        context.setTransform(outputScale, 0, 0, outputScale, 0, 0)

        renderTask = page.render({
          canvasContext: context,
          viewport,
        })

        await renderTask.promise
      } catch (error: any) {
        if (!cancelled && error?.name !== "RenderingCancelledException") {
          console.error("Failed to render PDF page:", error)
        }
      } finally {
        if (!cancelled) {
          setIsRendering(false)
        }
      }
    }

    renderPage()

    return () => {
      cancelled = true
      if (renderTask?.cancel) {
        renderTask.cancel()
      }
    }
  }, [pdf, pageNumber, scale])

  return (
    <div className="relative flex justify-center">
      {isRendering && (
        <div className="absolute inset-0 flex items-center justify-center rounded-md bg-white/70 text-sm text-zinc-700">
          Rendering...
        </div>
      )}
      <canvas ref={canvasRef} className="block max-w-full rounded-md" />
    </div>
  )
}

export default function PdfEditorPage() {
  const [pdf, setPdf] = useState<PDFDoc | null>(null)
  const [pageCount, setPageCount] = useState(0)
  const [selectedPage, setSelectedPage] = useState(1)
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([])
  const [zoom, setZoom] = useState(100)
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingThumbs, setIsGeneratingThumbs] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const scale = useMemo(() => zoom / 100, [zoom])

  useEffect(() => {
    let cancelled = false

    const loadPdf = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const loadingTask = pdfjsLib.getDocument({
          url: PDF_URL,
        })

        const loadedPdf = await loadingTask.promise

        if (cancelled) return

        setPdf(loadedPdf)
        setPageCount(loadedPdf.numPages)
        setSelectedPage(1)
      } catch (err) {
        console.error("Failed to load PDF:", err)
        if (!cancelled) {
          setError("بارگذاری فایل PDF انجام نشد.")
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadPdf()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!pdf) return

    let cancelled = false

    const generateThumbnails = async () => {
      try {
        setIsGeneratingThumbs(true)

        const nextThumbnails: Thumbnail[] = []

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
          const page = await pdf.getPage(pageNumber)
          if (cancelled) return

          const viewport = page.getViewport({ scale: 0.22 })
          const canvas = document.createElement("canvas")
          const context = canvas.getContext("2d")

          if (!context) continue

          canvas.width = viewport.width
          canvas.height = viewport.height

          await page.render({
            canvasContext: context,
            viewport,
          }).promise

          nextThumbnails.push({
            pageNumber,
            dataUrl: canvas.toDataURL("image/png"),
          })
        }

        if (!cancelled) {
          setThumbnails(nextThumbnails)
        }
      } catch (err) {
        console.error("Failed to generate thumbnails:", err)
      } finally {
        if (!cancelled) {
          setIsGeneratingThumbs(false)
        }
      }
    }

    generateThumbnails()

    return () => {
      cancelled = true
    }
  }, [pdf])

  const goToPrevPage = () => {
    setSelectedPage((current) => Math.max(1, current - 1))
  }

  const goToNextPage = () => {
    setSelectedPage((current) => Math.min(pageCount, current + 1))
  }

  const zoomOut = () => {
    setZoom((current) => Math.max(50, current - 10))
  }

  const zoomIn = () => {
    setZoom((current) => Math.min(300, current + 10))
  }

  return (
    <div className="flex h-full min-h-0 bg-zinc-950 text-zinc-100">
      <aside className="hidden w-60 shrink-0 border-r border-zinc-900 bg-zinc-950/80 md:flex md:flex-col">
        <div className="border-b border-zinc-900 px-4 py-3">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500">
            Pages
          </p>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-3">
          {isLoading && (
            <div className="rounded-lg border border-zinc-900 bg-zinc-900/40 p-3 text-xs text-zinc-400">
              Loading PDF...
            </div>
          )}

          {!isLoading &&
            thumbnails.map((page) => (
              <button
                key={page.pageNumber}
                onClick={() => setSelectedPage(page.pageNumber)}
                className={`group w-full rounded-lg border p-2 text-left transition ${
                  page.pageNumber === selectedPage
                    ? "border-zinc-700 bg-zinc-900"
                    : "border-zinc-900 bg-zinc-950 hover:border-zinc-800 hover:bg-zinc-900/50"
                }`}
              >
                <img
                  src={page.dataUrl}
                  alt={`Page ${page.pageNumber}`}
                  className="aspect-[3/4] w-full rounded-md border border-zinc-800 bg-white object-contain"
                />
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400">
                    Page {page.pageNumber}
                  </span>
                  <FileText className="h-3.5 w-3.5 text-zinc-600 group-hover:text-zinc-400" />
                </div>
              </button>
            ))}

          {!isLoading && isGeneratingThumbs && thumbnails.length === 0 && (
            <div className="rounded-lg border border-zinc-900 bg-zinc-900/40 p-3 text-xs text-zinc-400">
              Generating thumbnails...
            </div>
          )}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-900 bg-zinc-950/90 px-4">
          <div className="flex items-center gap-3">
            <div className="rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-1.5">
              <p className="text-[11px] text-zinc-300">contract-final.pdf</p>
            </div>

            <div className="hidden items-center gap-1 md:flex">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Redo2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="hidden items-center gap-1 lg:flex">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MousePointer2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Type className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Highlighter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Shapes className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-1 rounded-md border border-zinc-800 bg-zinc-900/60 p-1 md:flex">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={zoomOut}>
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <span className="px-2 text-[11px] text-zinc-400">{zoom}%</span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={zoomIn}>
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>

            <Button variant="outline" size="sm" className="h-8 border-zinc-800 text-xs">
              <Save className="mr-1 h-3.5 w-3.5" />
              Save
            </Button>
            <Button
              size="sm"
              className="h-8 bg-zinc-100 text-xs text-zinc-950 hover:bg-zinc-200"
            >
              <Download className="mr-1 h-3.5 w-3.5" />
              Export
            </Button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          <main className="flex min-w-0 flex-1 flex-col items-center overflow-y-auto bg-[#0a0a0a] px-6 py-8">
            <div className="mb-6 flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/70 px-3 py-1.5 text-[11px] text-zinc-400">
              <button onClick={goToPrevPage} disabled={selectedPage === 1}>
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span>
                Page {selectedPage} of {pageCount || 0}
              </span>
              <button onClick={goToNextPage} disabled={selectedPage === pageCount || pageCount === 0}>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {error && (
              <div className="w-full max-w-3xl rounded-md border border-red-900 bg-red-950/40 p-4 text-sm text-red-200">
                {error}
              </div>
            )}

            {!error && isLoading && (
              <div className="w-full max-w-3xl rounded-md border border-zinc-800 bg-zinc-900/40 p-6 text-sm text-zinc-300">
                Loading document...
              </div>
            )}

            {!error && pdf && (
              <div className="w-full max-w-4xl">
                <section className="mx-auto flex w-full max-w-3xl justify-center rounded-md border border-zinc-800 bg-white p-3 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
                  <PdfPageCanvas
                    pdf={pdf}
                    pageNumber={selectedPage}
                    scale={scale}
                  />
                </section>
              </div>
            )}
          </main>

          <aside className="hidden w-72 shrink-0 border-l border-zinc-900 bg-zinc-950/80 xl:flex xl:flex-col">
            <div className="border-b border-zinc-900 px-4 py-3">
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                Properties
              </p>
            </div>

            <div className="space-y-6 p-4">
              <div className="space-y-2">
                <p className="text-xs font-medium text-zinc-200">Selected Tool</p>
                <div className="rounded-lg border border-zinc-900 bg-zinc-900/50 p-3">
                  <p className="text-[11px] text-zinc-400">Text Annotation</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-zinc-200">Color</p>
                <div className="flex gap-2">
                  {["bg-yellow-400", "bg-blue-400", "bg-red-400", "bg-green-400"].map((color) => (
                    <button
                      key={color}
                      className={`h-6 w-6 rounded-full ${color} ring-1 ring-white/10`}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-zinc-200">Opacity</p>
                <div className="rounded-lg border border-zinc-900 bg-zinc-900/50 p-3">
                  <div className="h-1.5 rounded-full bg-zinc-800">
                    <div className="h-1.5 w-2/3 rounded-full bg-zinc-200" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-zinc-200">Actions</p>
                <div className="grid gap-2">
                  <Button
                    variant="outline"
                    className="justify-start border-zinc-900 text-xs text-zinc-300"
                  >
                    <Search className="mr-2 h-3.5 w-3.5" />
                    Find in document
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start border-zinc-900 text-xs text-zinc-300"
                  >
                    <Printer className="mr-2 h-3.5 w-3.5" />
                    Print document
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start border-zinc-900 text-xs text-zinc-300"
                  >
                    <Sidebar className="mr-2 h-3.5 w-3.5" />
                    Toggle thumbnails
                  </Button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

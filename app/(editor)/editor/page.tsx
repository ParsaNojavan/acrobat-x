"use client"

import { useEffect, useMemo, useRef, useState, MouseEvent } from "react"
import * as pdfjsLib from "pdfjs-dist"
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Highlighter,
  Minus,
  MousePointer2,
  Pencil,
  Plus,
  Printer,
  Redo2,
  Square,
  Sidebar,
  Type,
  Undo2,
  Loader2,
  Trash2,
  Circle,
  MoveRight,
  Triangle,
  Star,
  Search,
  X,
  PanelRight,
  PanelRightClose
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

type Point = {
  x: number
  y: number
}

export type ToolType = "pointer" | "text" | "highlighter" | "pencil" | "shape"
export type ShapeType = "rect" | "circle" | "line" | "arrow" | "triangle" | "star"

export type Annotation = {
  id: string
  type: "stroke" | "highlight" | "text" | "rect" | "circle" | "line" | "arrow" | "triangle" | "star"
  page: number
  color: string
  opacity: number
  strokeWidth?: number
  points?: Point[]
  x?: number
  y?: number
  width?: number
  height?: number
  text?: string
  fontSize?: number
}

type SearchMatch = {
  pageNumber: number
  text: string
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  return { r, g, b }
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) {
  let rot = (Math.PI / 2) * 3
  let x = cx
  let y = cy
  const step = Math.PI / spikes

  ctx.beginPath()
  ctx.moveTo(cx, cy - outerRadius)
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius
    y = cy + Math.sin(rot) * outerRadius
    ctx.lineTo(x, y)
    rot += step

    x = cx + Math.cos(rot) * innerRadius
    y = cy + Math.sin(rot) * innerRadius
    ctx.lineTo(x, y)
    rot += step
  }
  ctx.lineTo(cx, cy - outerRadius)
  ctx.closePath()
  ctx.stroke()
}

function drawArrowhead(ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number, radius: number) {
  const angle = Math.atan2(toY - fromY, toX - fromX)
  ctx.beginPath()
  ctx.moveTo(toX, toY)
  ctx.lineTo(toX - radius * Math.cos(angle - Math.PI / 6), toY - radius * Math.sin(angle - Math.PI / 6))
  ctx.moveTo(toX, toY)
  ctx.lineTo(toX - radius * Math.cos(angle + Math.PI / 6), toY - radius * Math.sin(angle + Math.PI / 6))
  ctx.stroke()
}

function PdfPageCanvas({
  pdf,
  pageNumber,
  scale,
  currentTool,
  currentShape,
  currentColor,
  currentOpacity,
  currentThickness,
  currentFontSize,
  annotations,
  selectedId,
  onSelect,
  onAddAnnotation,
  onUpdateAnnotation,
}: {
  pdf: PDFDoc
  pageNumber: number
  scale: number
  currentTool: ToolType
  currentShape: ShapeType
  currentColor: string
  currentOpacity: number
  currentThickness: number
  currentFontSize: number
  annotations: Annotation[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  onAddAnnotation: (ann: Annotation) => void
  onUpdateAnnotation: (ann: Annotation) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const drawCanvasRef = useRef<HTMLCanvasElement | null>(null)

  const [isRendering, setIsRendering] = useState(false)
  const [activeDrawing, setActiveDrawing] = useState<Annotation | null>(null)
  const [draggingAnn, setDraggingAnn] = useState<{ id: string; startPos: Point; origPos?: Point; origPoints?: Point[] } | null>(null)
  
  const [textInput, setTextInput] = useState<{ x: number; y: number; value: string } | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const renderTaskRef = useRef<any>(null)

  useEffect(() => {
    if (textInput && inputRef.current) {
      inputRef.current.focus()
    }
  }, [textInput])

  useEffect(() => {
    let cancelled = false
    const renderPage = async () => {
      try {
        if (renderTaskRef.current) try { renderTaskRef.current.cancel() } catch {}
        setIsRendering(true)
        const page = await pdf.getPage(pageNumber)
        if (cancelled) return

        const viewport = page.getViewport({ scale })
        const canvas = canvasRef.current
        const drawCanvas = drawCanvasRef.current
        if (!canvas || !drawCanvas) return
        const context = canvas.getContext("2d")
        if (!context) return

        const outputScale = window.devicePixelRatio || 1
        canvas.width = Math.floor(viewport.width * outputScale)
        canvas.height = Math.floor(viewport.height * outputScale)
        canvas.style.width = `${viewport.width}px`
        canvas.style.height = `${viewport.height}px`
        context.setTransform(outputScale, 0, 0, outputScale, 0, 0)

        drawCanvas.width = viewport.width
        drawCanvas.height = viewport.height
        drawCanvas.style.width = `${viewport.width}px`
        drawCanvas.style.height = `${viewport.height}px`

        const renderTask = page.render({ canvasContext: context, viewport, canvas })
        renderTaskRef.current = renderTask
        await renderTask.promise
        if (!cancelled) redraw(drawCanvas)
      } catch (error: any) {
        if (!cancelled && error?.name !== "RenderingCancelledException") console.error(error)
      } finally {
        if (!cancelled) setIsRendering(false)
      }
    }
    renderPage()
    return () => { cancelled = true }
  }, [pdf, pageNumber, scale])

  const redraw = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const list = [...annotations.filter((a) => a.page === pageNumber)]
    if (activeDrawing && activeDrawing.page === pageNumber) list.push(activeDrawing)

    list.forEach((ann) => {
      ctx.save()
      ctx.globalAlpha = ann.opacity
      ctx.strokeStyle = ann.color
      ctx.fillStyle = ann.color
      ctx.lineWidth = (ann.strokeWidth || 2) * scale
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      if ((ann.type === "stroke" || ann.type === "highlight") && ann.points && ann.points.length > 1) {
        if (ann.type === "highlight") {
          ctx.globalCompositeOperation = "multiply"
          ctx.lineCap = "square"
        }
        ctx.beginPath()
        ctx.moveTo(ann.points[0].x * scale, ann.points[0].y * scale)
        for (let i = 1; i < ann.points.length; i++) {
          ctx.lineTo(ann.points[i].x * scale, ann.points[i].y * scale)
        }
        ctx.stroke()
      } else if (ann.type === "line" && ann.points && ann.points.length > 1) {
        ctx.beginPath()
        ctx.moveTo(ann.points[0].x * scale, ann.points[0].y * scale)
        ctx.lineTo(ann.points[1].x * scale, ann.points[1].y * scale)
        ctx.stroke()
      } else if (ann.type === "arrow" && ann.points && ann.points.length > 1) {
        ctx.beginPath()
        ctx.moveTo(ann.points[0].x * scale, ann.points[0].y * scale)
        ctx.lineTo(ann.points[1].x * scale, ann.points[1].y * scale)
        ctx.stroke()
        drawArrowhead(ctx, ann.points[0].x * scale, ann.points[0].y * scale, ann.points[1].x * scale, ann.points[1].y * scale, Math.max(10, (ann.strokeWidth || 2) * 3 * scale))
      } else if (ann.type === "rect" && ann.x !== undefined && ann.y !== undefined && ann.width && ann.height) {
        ctx.strokeRect(ann.x * scale, ann.y * scale, ann.width * scale, ann.height * scale)
      } else if (ann.type === "circle" && ann.x !== undefined && ann.y !== undefined && ann.width && ann.height) {
        ctx.beginPath()
        const rx = Math.abs(ann.width) / 2
        const ry = Math.abs(ann.height) / 2
        const cx = ann.x + ann.width / 2
        const cy = ann.y + ann.height / 2
        ctx.ellipse(cx * scale, cy * scale, rx * scale, ry * scale, 0, 0, 2 * Math.PI)
        ctx.stroke()
      } else if (ann.type === "triangle" && ann.x !== undefined && ann.y !== undefined && ann.width && ann.height) {
        ctx.beginPath()
        ctx.moveTo((ann.x + ann.width / 2) * scale, ann.y * scale)
        ctx.lineTo(ann.x * scale, (ann.y + ann.height) * scale)
        ctx.lineTo((ann.x + ann.width) * scale, (ann.y + ann.height) * scale)
        ctx.closePath()
        ctx.stroke()
      } else if (ann.type === "star" && ann.x !== undefined && ann.y !== undefined && ann.width && ann.height) {
        const outerR = (Math.max(Math.abs(ann.width), Math.abs(ann.height)) / 2) * scale
        const innerR = outerR / 2.5
        const cx = (ann.x + ann.width / 2) * scale
        const cy = (ann.y + ann.height / 2) * scale
        drawStar(ctx, cx, cy, 5, outerR, innerR)
      } else if (ann.type === "text" && ann.x !== undefined && ann.y !== undefined && ann.text) {
        const fSize = (ann.fontSize || 24) * scale
        ctx.font = `${fSize}px sans-serif`
        ctx.fillText(ann.text, ann.x * scale, ann.y * scale)
      }

      if (ann.id === selectedId) {
        ctx.restore()
        ctx.save()
        ctx.strokeStyle = "#3b82f6"
        ctx.lineWidth = 1.5
        ctx.setLineDash([4, 4])

        if (ann.type === "text" && ann.x !== undefined && ann.y !== undefined && ann.text) {
          const fSize = (ann.fontSize || 24) * scale
          ctx.font = `${fSize}px sans-serif`
          const metrics = ctx.measureText(ann.text)
          ctx.strokeRect(ann.x * scale - 4, ann.y * scale - fSize - 2, metrics.width + 8, fSize + 8)
        } else if (ann.x !== undefined && ann.y !== undefined && ann.width && ann.height) {
          const x1 = Math.min(ann.x, ann.x + ann.width)
          const y1 = Math.min(ann.y, ann.y + ann.height)
          ctx.strokeRect(x1 * scale - 4, y1 * scale - 4, Math.abs(ann.width) * scale + 8, Math.abs(ann.height) * scale + 8)
        } else if (ann.points && ann.points.length > 0) {
          const xs = ann.points.map(p => p.x)
          const ys = ann.points.map(p => p.y)
          const minX = Math.min(...xs), maxX = Math.max(...xs)
          const minY = Math.min(...ys), maxY = Math.max(...ys)
          ctx.strokeRect(minX * scale - 4, minY * scale - 4, (maxX - minX) * scale + 8, (maxY - minY) * scale + 8)
        }
      }
      ctx.restore()
    })
  }

  useEffect(() => {
    if (drawCanvasRef.current) redraw(drawCanvasRef.current)
  }, [annotations, activeDrawing, scale, pageNumber, selectedId])

  const getCoordinates = (e: MouseEvent<HTMLCanvasElement>): Point => {
    const rect = drawCanvasRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return { x: (e.clientX - rect.left) / scale, y: (e.clientY - rect.top) / scale }
  }

  const findAnnotationUnderPoint = (pt: Point): Annotation | null => {
    const pageAnns = annotations.filter((a) => a.page === pageNumber)
    for (let i = pageAnns.length - 1; i >= 0; i--) {
      const ann = pageAnns[i]
      if (ann.type === "text" && ann.x !== undefined && ann.y !== undefined && ann.text) {
        const fSize = ann.fontSize || 24
        const estW = ann.text.length * (fSize * 0.6)
        if (pt.x >= ann.x - 4 && pt.x <= ann.x + estW + 4 && pt.y >= ann.y - fSize - 4 && pt.y <= ann.y + 4) return ann
      } else if (ann.x !== undefined && ann.y !== undefined && ann.width && ann.height) {
        const x1 = Math.min(ann.x, ann.x + ann.width)
        const x2 = Math.max(ann.x, ann.x + ann.width)
        const y1 = Math.min(ann.y, ann.y + ann.height)
        const y2 = Math.max(ann.y, ann.y + ann.height)
        if (pt.x >= x1 && pt.x <= x2 && pt.y >= y1 && pt.y <= y2) return ann
      } else if (ann.points && ann.points.length > 0) {
        const xs = ann.points.map(p => p.x)
        const ys = ann.points.map(p => p.y)
        const minX = Math.min(...xs), maxX = Math.max(...xs)
        const minY = Math.min(...ys), maxY = Math.max(...ys)
        if (pt.x >= minX - 10 && pt.x <= maxX + 10 && pt.y >= minY - 10 && pt.y <= maxY + 10) return ann
      }
    }
    return null
  }

  const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    const coords = getCoordinates(e)

    if (currentTool === "pointer") {
      const hit = findAnnotationUnderPoint(coords)
      if (hit) {
        onSelect(hit.id)
        setDraggingAnn({
          id: hit.id,
          startPos: coords,
          origPos: hit.x !== undefined && hit.y !== undefined ? { x: hit.x, y: hit.y } : undefined,
          origPoints: hit.points ? hit.points.map(p => ({ ...p })) : undefined
        })
      } else {
        onSelect(null)
      }
      return
    }

    if (currentTool === "text") {
      setTextInput({ x: coords.x, y: coords.y, value: "" })
      return
    }

    if (currentTool === "pencil" || currentTool === "highlighter") {
      setActiveDrawing({
        id: Math.random().toString(),
        type: currentTool === "pencil" ? "stroke" : "highlight",
        page: pageNumber,
        color: currentColor,
        opacity: currentOpacity,
        points: [coords],
        strokeWidth: currentThickness,
      })
    } else if (currentTool === "shape") {
      if (currentShape === "line" || currentShape === "arrow") {
        setActiveDrawing({
          id: Math.random().toString(),
          type: currentShape,
          page: pageNumber,
          color: currentColor,
          opacity: currentOpacity,
          points: [coords, coords],
          strokeWidth: currentThickness,
        })
      } else {
        setActiveDrawing({
          id: Math.random().toString(),
          type: currentShape,
          page: pageNumber,
          color: currentColor,
          opacity: currentOpacity,
          x: coords.x,
          y: coords.y,
          width: 0,
          height: 0,
          strokeWidth: currentThickness,
        })
      }
    }
  }

  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    const coords = getCoordinates(e)

    if (draggingAnn && currentTool === "pointer") {
      const dx = coords.x - draggingAnn.startPos.x
      const dy = coords.y - draggingAnn.startPos.y
      const ann = annotations.find((a) => a.id === draggingAnn.id)
      if (ann) {
        if (ann.x !== undefined && ann.y !== undefined && draggingAnn.origPos) {
          onUpdateAnnotation({ ...ann, x: draggingAnn.origPos.x + dx, y: draggingAnn.origPos.y + dy })
        } else if (ann.points && draggingAnn.origPoints) {
          const movedPoints = draggingAnn.origPoints.map(p => ({ x: p.x + dx, y: p.y + dy }))
          onUpdateAnnotation({ ...ann, points: movedPoints })
        }
      }
      return
    }

    if (!activeDrawing) return

    if ((activeDrawing.type === "stroke" || activeDrawing.type === "highlight") && activeDrawing.points) {
      setActiveDrawing({ ...activeDrawing, points: [...activeDrawing.points, coords] })
    } else if ((activeDrawing.type === "line" || activeDrawing.type === "arrow") && activeDrawing.points) {
      setActiveDrawing({ ...activeDrawing, points: [activeDrawing.points[0], coords] })
    } else if (activeDrawing.x !== undefined && activeDrawing.y !== undefined) {
      setActiveDrawing({ ...activeDrawing, width: coords.x - activeDrawing.x, height: coords.y - activeDrawing.y })
    }
  }

  const handleMouseUp = () => {
    if (draggingAnn) setDraggingAnn(null)
    if (!activeDrawing) return

    if ((activeDrawing.type === "stroke" || activeDrawing.type === "highlight" || activeDrawing.type === "line" || activeDrawing.type === "arrow") && activeDrawing.points && activeDrawing.points.length > 1) {
      onAddAnnotation(activeDrawing)
    } else if (activeDrawing.width && Math.abs(activeDrawing.width) > 4) {
      onAddAnnotation(activeDrawing)
    }

    setActiveDrawing(null)
  }

  const submitText = () => {
    if (textInput && textInput.value.trim()) {
      onAddAnnotation({
        id: Math.random().toString(),
        type: "text",
        page: pageNumber,
        color: currentColor,
        opacity: currentOpacity,
        x: textInput.x,
        y: textInput.y,
        text: textInput.value,
        fontSize: currentFontSize,
      })
    }
    setTextInput(null)
  }

  return (
    <div
      className="relative flex justify-center"
      style={{
        width: canvasRef.current ? canvasRef.current.style.width : "auto",
        height: canvasRef.current ? canvasRef.current.style.height : "auto",
      }}
    >
      {isRendering && (
        <div className="absolute inset-0 z-30 flex items-center justify-center rounded-md bg-zinc-950/60 backdrop-blur-xs text-xs font-medium text-zinc-300">
          Loading Page {pageNumber}...
        </div>
      )}
      <canvas ref={canvasRef} className="block rounded-md shadow-sm" />
      <canvas
        ref={drawCanvasRef}
        className="absolute top-0 left-0 block rounded-md z-20"
        style={{
          cursor: currentTool === "pointer" ? "default" : currentTool === "text" ? "text" : "crosshair",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      {textInput && (
        <div
          className="absolute z-30 flex items-center bg-zinc-900 border border-zinc-700 rounded-md shadow-2xl p-1.5"
          style={{ left: `${textInput.x * scale}px`, top: `${textInput.y * scale - (currentFontSize * scale + 16)}px` }}
        >
          <input
            ref={inputRef}
            type="text"
            value={textInput.value}
            onChange={(e) => setTextInput({ ...textInput, value: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitText()
              if (e.key === "Escape") setTextInput(null)
            }}
            placeholder="Type text and press enter..."
            style={{ fontSize: `${Math.max(12, currentFontSize * scale * 0.85)}px`, color: currentColor }}
            className="bg-transparent px-2 py-0.5 outline-none min-w-[200px]"
          />
          <Button size="sm" variant="ghost" className="h-6 px-2 text-xs text-zinc-300" onClick={submitText}>
            OK
          </Button>
        </div>
      )}
    </div>
  )
}

export default function PdfEditorPage() {
  const [pdf, setPdf] = useState<PDFDoc | null>(null)
  const [pageCount, setPageCount] = useState(0)
  const [selectedPage, setSelectedPage] = useState(1)
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([])

  const [showThumbnails, setShowThumbnails] = useState(true)
  const [showProperties, setShowProperties] = useState(true)

  const [zoom, setZoom] = useState(100)
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  // Tools & shapes
  const [currentTool, setCurrentTool] = useState<ToolType>("pointer")
  const [currentShape, setCurrentShape] = useState<ShapeType>("rect")
  const [currentColor, setCurrentColor] = useState("#facc15")
  const [currentOpacity, setCurrentOpacity] = useState(1)
  const [currentThickness, setCurrentThickness] = useState(3)
  const [currentFontSize, setCurrentFontSize] = useState(24) // Default larger font size

  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [redoStack, setRedoStack] = useState<Annotation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Search
  const [isSearching, setIsSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchMatch[]>([])
  const [activeSearchIndex, setActiveSearchIndex] = useState(0)

  // Continuous scroll references
  const pageRefs = useRef<(HTMLDivElement | null)[]>([])
  const containerRef = useRef<HTMLElement | null>(null)
  const isProgrammaticScroll = useRef(false)

  const scale = useMemo(() => zoom / 100, [zoom])

  const selectedAnnotation = useMemo(() => {
    return annotations.find((a) => a.id === selectedId) || null
  }, [annotations, selectedId])

  const availableColors = [
    { hex: "#facc15", class: "bg-yellow-400" },
    { hex: "#60a5fa", class: "bg-blue-400" },
    { hex: "#f87171", class: "bg-red-400" },
    { hex: "#4ade80", class: "bg-green-400" },
    { hex: "#c084fc", class: "bg-purple-400" },
    { hex: "#ffffff", class: "bg-white" },
    { hex: "#000000", class: "bg-black" },
  ]

  // Track active page on scroll
  useEffect(() => {
    if (!pageCount || !containerRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScroll.current) return

        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length > 0) {
          const topEntry = visible.reduce((prev, curr) =>
            curr.intersectionRatio > prev.intersectionRatio ? curr : prev
          )
          const pageNum = Number(topEntry.target.getAttribute("data-page"))
          if (pageNum) setSelectedPage(pageNum)
        }
      },
      {
        root: containerRef.current,
        threshold: [0.2, 0.5, 0.8],
      }
    )

    pageRefs.current.forEach((el) => {
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [pageCount])

  const scrollToPage = (pageNum: number) => {
    if (pageNum < 1 || pageNum > pageCount) return
    setSelectedPage(pageNum)
    isProgrammaticScroll.current = true

    const el = pageRefs.current[pageNum - 1]
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
      setTimeout(() => {
        isProgrammaticScroll.current = false
      }, 600)
    }
  }

  // Keyboard shortcut delete
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        setAnnotations((prev) => prev.filter((a) => a.id !== selectedId))
        setSelectedId(null)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedId])

  // Load PDF
  useEffect(() => {
    let cancelled = false
    const loadPdf = async () => {
      try {
        setIsLoading(true)
        const loadingTask = pdfjsLib.getDocument({ url: PDF_URL })
        const loadedPdf = await loadingTask.promise
        if (cancelled) return
        setPdf(loadedPdf)
        setPageCount(loadedPdf.numPages)
      } catch (err) {
        console.error(err)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    loadPdf()
    return () => { cancelled = true }
  }, [])

  // Render thumbnails
  useEffect(() => {
    if (!pdf) return
    let cancelled = false
    const generateThumbnails = async () => {
      try {
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
          await page.render({ canvasContext: context, viewport, canvas }).promise
          nextThumbnails.push({ pageNumber, dataUrl: canvas.toDataURL("image/png") })
        }
        if (!cancelled) setThumbnails(nextThumbnails)
      } catch (err) {}
    }
    generateThumbnails()
    return () => { cancelled = true }
  }, [pdf])

  // Text search
  const executeSearch = async (query: string) => {
    if (!pdf || !query.trim()) {
      setSearchResults([])
      return
    }
    const results: SearchMatch[] = []
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()
      const combinedText = textContent.items.map((item: any) => item.str).join(" ")
      if (combinedText.toLowerCase().includes(query.toLowerCase())) {
        results.push({ pageNumber: pageNum, text: combinedText })
      }
    }
    setSearchResults(results)
    setActiveSearchIndex(0)
    if (results.length > 0) {
      scrollToPage(results[0].pageNumber)
    }
  }

  const handleNextSearch = () => {
    if (searchResults.length === 0) return
    const nextIdx = (activeSearchIndex + 1) % searchResults.length
    setActiveSearchIndex(nextIdx)
    scrollToPage(searchResults[nextIdx].pageNumber)
  }

  const handlePrevSearch = () => {
    if (searchResults.length === 0) return
    const prevIdx = (activeSearchIndex - 1 + searchResults.length) % searchResults.length
    setActiveSearchIndex(prevIdx)
    scrollToPage(searchResults[prevIdx].pageNumber)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExport = async () => {
    try {
      setIsExporting(true)
      const existingPdfBytes = await fetch(PDF_URL).then((res) => res.arrayBuffer())
      const pdfDoc = await PDFDocument.load(existingPdfBytes)
      const pages = pdfDoc.getPages()
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

      annotations.forEach((ann) => {
        if (ann.page > pages.length) return
        const page = pages[ann.page - 1]
        const { height } = page.getSize()
        const { r, g, b } = hexToRgb(ann.color)

        if ((ann.type === "stroke" || ann.type === "highlight" || ann.type === "line" || ann.type === "arrow") && ann.points && ann.points.length > 1) {
          for (let i = 0; i < ann.points.length - 1; i++) {
            page.drawLine({
              start: { x: ann.points[i].x, y: height - ann.points[i].y },
              end: { x: ann.points[i+1].x, y: height - ann.points[i+1].y },
              thickness: ann.strokeWidth || 2,
              color: rgb(r, g, b),
              opacity: ann.opacity,
            })
          }
        } else if (ann.type === "rect" && ann.x !== undefined && ann.y !== undefined && ann.width && ann.height) {
          page.drawRectangle({
            x: ann.x,
            y: height - ann.y - ann.height,
            width: ann.width,
            height: ann.height,
            borderColor: rgb(r, g, b),
            borderWidth: ann.strokeWidth || 2,
            opacity: ann.opacity,
          })
        } else if (ann.type === "circle" && ann.x !== undefined && ann.y !== undefined && ann.width && ann.height) {
          page.drawEllipse({
            x: ann.x + ann.width / 2,
            y: height - (ann.y + ann.height / 2),
            xScale: Math.abs(ann.width) / 2,
            yScale: Math.abs(ann.height) / 2,
            borderColor: rgb(r, g, b),
            borderWidth: ann.strokeWidth || 2,
            opacity: ann.opacity,
          })
        } else if (ann.type === "text" && ann.x !== undefined && ann.y !== undefined && ann.text) {
          page.drawText(ann.text, {
            x: ann.x,
            y: height - ann.y,
            size: ann.fontSize || 24,
            font: font,
            color: rgb(r, g, b),
            opacity: ann.opacity,
          })
        }
      })

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: "application/pdf" })
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = `edited-document.pdf`
      link.click()
    } catch (err) {
      alert("Failed to export PDF")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex h-screen min-h-0 bg-zinc-950 text-zinc-100 overflow-hidden select-none font-sans">
      {/* Left Sidebar (Thumbnails) */}
      <aside
        className={`hidden md:flex flex-col shrink-0 border-r border-zinc-900 bg-zinc-950/90 transition-all duration-300 ease-in-out overflow-hidden ${
          showThumbnails ? "w-60 opacity-100" : "w-0 opacity-0 pointer-events-none border-none"
        }`}
      >
        <div className="border-b border-zinc-900 px-4 py-3 flex justify-between items-center whitespace-nowrap">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500">Pages</p>
          <span className="text-[10px] text-zinc-600">{pageCount} total</span>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-3">
          {thumbnails.map((page) => (
            <button
              key={page.pageNumber}
              onClick={() => scrollToPage(page.pageNumber)}
              className={`group w-full rounded-lg border p-2 text-left transition ${
                page.pageNumber === selectedPage ? "border-blue-500/50 bg-zinc-900 shadow-sm" : "border-zinc-900 hover:bg-zinc-900/50"
              }`}
            >
              <img src={page.dataUrl} className="aspect-[3/4] w-full rounded-md border border-zinc-800 bg-white object-contain" />
              <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400">
                <span>Page {page.pageNumber}</span>
              </div>
            </button>
          ))}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col relative">
        {/* Header */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-900 bg-zinc-950/90 px-4 z-20">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              title="Toggle Page Thumbnails"
              className={`h-8 w-8 ${showThumbnails ? "text-zinc-200 bg-zinc-900/60" : "text-zinc-500 hover:text-white"}`}
              onClick={() => setShowThumbnails(!showThumbnails)}
            >
              <Sidebar className="h-4 w-4" />
            </Button>

            <div className="rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 hidden md:block">
              <p className="text-[11px] text-zinc-300 font-medium">contract-final.pdf</p>
            </div>

            <div className="hidden items-center gap-1 md:flex ml-2">
              <Button
                variant="ghost"
                size="icon"
                title="Undo"
                className="h-8 w-8 text-zinc-400 hover:text-white disabled:opacity-30"
                onClick={() => {
                  if (annotations.length > 0) {
                    setRedoStack((p) => [...p, annotations[annotations.length - 1]])
                    setAnnotations((p) => p.slice(0, -1))
                  }
                }}
                disabled={annotations.length === 0}
              >
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                title="Redo"
                className="h-8 w-8 text-zinc-400 hover:text-white disabled:opacity-30"
                onClick={() => {
                  if (redoStack.length > 0) {
                    setAnnotations((p) => [...p, redoStack[redoStack.length - 1]])
                    setRedoStack((p) => p.slice(0, -1))
                  }
                }}
                disabled={redoStack.length === 0}
              >
                <Redo2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Tools toolbar */}
          <div className="hidden items-center gap-1 lg:flex bg-zinc-900/50 border border-zinc-800/80 rounded-lg p-0.5 shadow-inner">
            <Button
              variant="ghost"
              size="icon"
              title="Pointer / Select"
              className={`h-8 w-8 ${currentTool === "pointer" ? "bg-zinc-800 text-white shadow-xs" : "text-zinc-400 hover:text-white"}`}
              onClick={() => setCurrentTool("pointer")}
            >
              <MousePointer2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Text"
              className={`h-8 w-8 ${currentTool === "text" ? "bg-zinc-800 text-white shadow-xs" : "text-zinc-400 hover:text-white"}`}
              onClick={() => setCurrentTool("text")}
            >
              <Type className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Highlighter"
              className={`h-8 w-8 ${currentTool === "highlighter" ? "bg-zinc-800 text-white shadow-xs" : "text-zinc-400 hover:text-white"}`}
              onClick={() => setCurrentTool("highlighter")}
            >
              <Highlighter className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Pencil"
              className={`h-8 w-8 ${currentTool === "pencil" ? "bg-zinc-800 text-white shadow-xs" : "text-zinc-400 hover:text-white"}`}
              onClick={() => setCurrentTool("pencil")}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Shapes"
              className={`h-8 w-8 ${currentTool === "shape" ? "bg-zinc-800 text-white shadow-xs" : "text-zinc-400 hover:text-white"}`}
              onClick={() => setCurrentTool("shape")}
            >
              <Square className="h-4 w-4" />
            </Button>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              title="Search"
              className={`h-8 w-8 transition-colors ${isSearching ? "text-blue-400 bg-zinc-900" : "text-zinc-400 hover:text-white"}`}
              onClick={() => setIsSearching(!isSearching)}
            >
              <Search className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              title="Print Document"
              className="h-8 w-8 text-zinc-400 hover:text-white"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4" />
            </Button>

            {/* Zoom Controls */}
            <div className="hidden items-center gap-0.5 rounded-md border border-zinc-800 bg-zinc-900/60 p-0.5 md:flex">
              <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-white" onClick={() => setZoom((z) => Math.max(50, z - 20))}>
                <Minus className="h-3 w-3" />
              </Button>
              <span className="px-1.5 text-[11px] text-zinc-400 min-w-10 text-center font-mono">{zoom}%</span>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-white" onClick={() => setZoom((z) => Math.min(300, z + 20))}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            {/* Export */}
            <Button size="sm" className="h-8 bg-zinc-100 text-xs text-zinc-950 font-medium hover:bg-zinc-200 ml-1" onClick={handleExport} disabled={isExporting}>
              {isExporting ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Download className="mr-1.5 h-3.5 w-3.5" />} Export PDF
            </Button>

            {/* Toggle Properties */}
            <Button
              variant="ghost"
              size="icon"
              title="Toggle Properties Panel"
              className={`h-8 w-8 ml-0.5 ${showProperties ? "text-zinc-200 bg-zinc-900/60" : "text-zinc-400 hover:text-white"}`}
              onClick={() => setShowProperties(!showProperties)}
            >
              {showProperties ? <PanelRightClose className="h-4 w-4" /> : <PanelRight className="h-4 w-4" />}
            </Button>
          </div>
        </header>

        {/* Floating Delicate Search Bar */}
        <div
          className={`absolute top-16 right-6 z-30 flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/90 px-3 py-1.5 shadow-2xl backdrop-blur-md transition-all duration-300 ease-out ${
            isSearching ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"
          }`}
        >
          <Search className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
          <input
            type="text"
            placeholder="Search text..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              executeSearch(e.target.value)
            }}
            className="bg-transparent text-xs text-white placeholder-zinc-500 outline-none w-44 tracking-wide"
          />
          {searchResults.length > 0 ? (
            <span className="text-[10px] text-zinc-400 font-mono tracking-tight shrink-0 px-1 border-x border-zinc-800">
              {activeSearchIndex + 1}/{searchResults.length}
            </span>
          ) : searchQuery.trim() ? (
            <span className="text-[10px] text-zinc-500 font-mono shrink-0 px-1">0 results</span>
          ) : null}
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800" onClick={handlePrevSearch} disabled={searchResults.length === 0}>
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800" onClick={handleNextSearch} disabled={searchResults.length === 0}>
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
          <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full text-zinc-500 hover:text-white hover:bg-zinc-800" onClick={() => setIsSearching(false)}>
            <X className="h-3 w-3" />
          </Button>
        </div>

        <div className="flex min-h-0 flex-1 relative overflow-hidden">
          {/* Floating Current Page Indicator (Fixed at z-40 above all Shapes & Canvases) */}
          <div className="pointer-events-none absolute top-4 left-0 right-0 z-40 flex justify-center">
            <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-zinc-800 bg-zinc-950/90 backdrop-blur-md px-3.5 py-1.5 text-xs text-zinc-300 shadow-2xl">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30"
                onClick={() => scrollToPage(selectedPage - 1)}
                disabled={selectedPage <= 1}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="font-mono text-[11px] font-medium tracking-tight">
                Page <span className="text-white font-semibold">{selectedPage}</span> of {pageCount}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30"
                onClick={() => scrollToPage(selectedPage + 1)}
                disabled={selectedPage >= pageCount}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Continuous Multi-Page Viewer Area */}
          <main
            ref={containerRef}
            className="flex min-w-0 flex-1 flex-col items-center overflow-auto bg-[#0a0a0a] px-6 pt-16 pb-20 scroll-smooth relative z-10"
          >
            {/* Continuous Pages Stack */}
            {pdf && (
              <div className="flex flex-col items-center gap-8 pb-16">
                {Array.from({ length: pageCount }, (_, i) => i + 1).map((pageNum) => (
                  <div
                    key={pageNum}
                    data-page={pageNum}
                    ref={(el) => { pageRefs.current[pageNum - 1] = el }}
                    className="w-fit transition-transform duration-150 origin-top"
                  >
                    <section className="mx-auto flex justify-center rounded-md border border-zinc-800 bg-white p-2 shadow-2xl">
                      <PdfPageCanvas
                        pdf={pdf}
                        pageNumber={pageNum}
                        scale={scale}
                        currentTool={currentTool}
                        currentShape={currentShape}
                        currentColor={currentColor}
                        currentOpacity={currentOpacity}
                        currentThickness={currentThickness}
                        currentFontSize={currentFontSize}
                        annotations={annotations}
                        selectedId={selectedId}
                        onSelect={setSelectedId}
                        onAddAnnotation={(ann) => {
                          setAnnotations((p) => [...p, ann])
                          setRedoStack([])
                        }}
                        onUpdateAnnotation={(upd) => setAnnotations((p) => p.map((a) => (a.id === upd.id ? upd : a)))}
                      />
                    </section>
                  </div>
                ))}
              </div>
            )}
          </main>

          {/* Right Sidebar (Properties Panel) */}
          <aside
            className={`flex flex-col shrink-0 border-l border-zinc-900 bg-zinc-950/90 transition-all duration-300 ease-in-out overflow-hidden ${
              showProperties ? "w-72 opacity-100" : "w-0 opacity-0 pointer-events-none border-none"
            }`}
          >
            <div className="border-b border-zinc-900 px-4 py-3 flex items-center justify-between whitespace-nowrap">
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500">Properties</p>
            </div>

            <div className="space-y-6 p-4 overflow-y-auto w-72">
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-zinc-300">Active Tool</p>
                <div className="rounded-lg border border-zinc-900 bg-zinc-900/50 p-2 text-center text-xs text-zinc-400 capitalize">
                  {currentTool}
                </div>
              </div>

              {/* Text Font Size Slider */}
              {(currentTool === "text" || (selectedAnnotation && selectedAnnotation.type === "text")) && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-zinc-300">Font Size</span>
                    <span className="text-zinc-500 font-mono">
                      {selectedAnnotation?.fontSize || currentFontSize}px
                    </span>
                  </div>
                  <div className="rounded-lg border border-zinc-900 bg-zinc-900/50 p-3">
                    <input
                      type="range"
                      min="12"
                      max="96"
                      step="2"
                      value={selectedAnnotation?.fontSize || currentFontSize}
                      onChange={(e) => {
                        const newSize = parseInt(e.target.value)
                        setCurrentFontSize(newSize)
                        if (selectedAnnotation && selectedAnnotation.type === "text") {
                          setAnnotations((prev) =>
                            prev.map((a) => (a.id === selectedAnnotation.id ? { ...a, fontSize: newSize } : a))
                          )
                        }
                      }}
                      className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Shapes Picker */}
              {currentTool === "shape" && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-zinc-300">Shape Type</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`h-9 flex flex-col gap-0.5 border-zinc-800 ${currentShape === "rect" ? "bg-zinc-800 text-white border-zinc-700" : "text-zinc-400 hover:text-white"}`}
                      onClick={() => setCurrentShape("rect")}
                    >
                      <Square className="h-3.5 w-3.5" />
                      <span className="text-[9px]">Rectangle</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`h-9 flex flex-col gap-0.5 border-zinc-800 ${currentShape === "circle" ? "bg-zinc-800 text-white border-zinc-700" : "text-zinc-400 hover:text-white"}`}
                      onClick={() => setCurrentShape("circle")}
                    >
                      <Circle className="h-3.5 w-3.5" />
                      <span className="text-[9px]">Circle</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`h-9 flex flex-col gap-0.5 border-zinc-800 ${currentShape === "line" ? "bg-zinc-800 text-white border-zinc-700" : "text-zinc-400 hover:text-white"}`}
                      onClick={() => setCurrentShape("line")}
                    >
                      <Minus className="h-3.5 w-3.5" />
                      <span className="text-[9px]">Line</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`h-9 flex flex-col gap-0.5 border-zinc-800 ${currentShape === "arrow" ? "bg-zinc-800 text-white border-zinc-700" : "text-zinc-400 hover:text-white"}`}
                      onClick={() => setCurrentShape("arrow")}
                    >
                      <MoveRight className="h-3.5 w-3.5" />
                      <span className="text-[9px]">Arrow</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`h-9 flex flex-col gap-0.5 border-zinc-800 ${currentShape === "triangle" ? "bg-zinc-800 text-white border-zinc-700" : "text-zinc-400 hover:text-white"}`}
                      onClick={() => setCurrentShape("triangle")}
                    >
                      <Triangle className="h-3.5 w-3.5" />
                      <span className="text-[9px]">Triangle</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`h-9 flex flex-col gap-0.5 border-zinc-800 ${currentShape === "star" ? "bg-zinc-800 text-white border-zinc-700" : "text-zinc-400 hover:text-white"}`}
                      onClick={() => setCurrentShape("star")}
                    >
                      <Star className="h-3.5 w-3.5" />
                      <span className="text-[9px]">Star</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* Color Palette */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-zinc-300">Color</p>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((color) => (
                    <button
                      key={color.hex}
                      onClick={() => {
                        setCurrentColor(color.hex)
                        if (selectedId) {
                          setAnnotations((prev) =>
                            prev.map((a) => (a.id === selectedId ? { ...a, color: color.hex } : a))
                          )
                        }
                      }}
                      className={`h-6 w-6 rounded-full transition-transform ${color.class} ${
                        (selectedAnnotation ? selectedAnnotation.color : currentColor) === color.hex
                          ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-zinc-950 scale-110"
                          : "ring-1 ring-white/10"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Line Thickness */}
              {currentTool !== "text" && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-zinc-300">Stroke Width</span>
                    <span className="text-zinc-500 font-mono">{currentThickness}px</span>
                  </div>
                  <div className="rounded-lg border border-zinc-900 bg-zinc-900/50 p-3">
                    <input
                      type="range"
                      min="1"
                      max="30"
                      value={currentThickness}
                      onChange={(e) => setCurrentThickness(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Opacity */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-zinc-300">Opacity</span>
                  <span className="text-zinc-500 font-mono">{Math.round(currentOpacity * 100)}%</span>
                </div>
                <div className="rounded-lg border border-zinc-900 bg-zinc-900/50 p-3">
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={currentOpacity}
                    onChange={(e) => setCurrentOpacity(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
              </div>

              {/* Selection Actions */}
              {selectedId && (
                <div className="space-y-2 pt-4 border-t border-zinc-900">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-red-900/40 text-xs text-red-400 hover:bg-red-950/20"
                    onClick={() => {
                      setAnnotations((p) => p.filter((a) => a.id !== selectedId))
                      setSelectedId(null)
                    }}
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete Selected Element
                  </Button>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

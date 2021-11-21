import { isTouchEvent } from "@ui-machines/utils"

export function distance(a: Point, b: Point = { x: 0, y: 0 }): number {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))
}

export function closest(...pts: Point[]) {
  return (a: Point): Point => {
    const ds = pts.map((b) => distance(b, a))
    const c = Math.min.apply(Math, ds)
    return pts[ds.indexOf(c)]
  }
}

export function withinPolygon(poly: Point[], point: Point) {
  const { x, y } = point
  let c = false

  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x
    const yi = poly[i].y
    const xj = poly[j].x
    const yj = poly[j].y

    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      c = !c
    }
  }
  return c
}

const fallback = { pageX: 0, pageY: 0, clientX: 0, clientY: 0 }

export function getEventPoint(e: AnyPointerEvent, t: PointType = "page"): Point {
  const p = isTouchEvent(e) ? e.touches[0] || e.changedTouches[0] || fallback : e
  return { x: p[`${t}X`], y: p[`${t}Y`] }
}

export function relativeToNode(p: Point, el: HTMLElement): RelativeValue {
  const dx = p.x - el.offsetLeft - el.clientLeft + el.scrollLeft
  const dy = p.y - el.offsetTop - el.clientTop + el.scrollTop
  return {
    point: { x: dx, y: dy },
    progress: { x: dx / el.offsetWidth, y: dy / el.offsetHeight },
  }
}

type AnyPointerEvent = MouseEvent | TouchEvent | PointerEvent

export type Point = {
  x: number
  y: number
}

type RelativeValue = {
  point: Point
  progress: { x: number; y: number }
}

type PointType = "page" | "client"

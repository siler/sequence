export interface Vector {
    x: number
    y: number
}

/**
 * - butt: line squared off at endpoint (default)
 * - round: line ends are rounded
 * - square: line ends are extended half the thickness and squared off
 */
type LineCap = 'butt' | 'round' | 'square'

/**
 * - bevel: creates a flat outside edge connecting the two outside line edges
 * - round: creates a round arc between the two outside line edges
 * - miter: creates a sharp point by continuing the two outside line edges
 */
type LineJoin = 'bevel' | 'round' | 'miter'

/**
 * draw the current path
 */
export interface Chainable {
    /**
     * fills the current path with the current fill style
     */
    fill(): Chainable

    /**
     * draws and fills the current path with their respective styles
     */
    fillAndStroke(): Chainable

    /**
     * draws the current path with the current stroke style
     */
    stroke(): Chainable
}

export interface Graphics {
    // 
    /**
     * sets path to a clockwise circular arc centered at (x, y)
     */
    arc(x: number, y: number, r: number, start: number, stop: number): Chainable

    /**
     * add a circular arc from the starting point to (x1, y1) then (x2, y2) to the path
     */
    arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void

    /**
     * begin a new path
     */
    beginPath(): Chainable

    /**
     * set path to a circle with the provided center and radius
     */
    circle(center: Vector, radius: number): Chainable

    /**
     * set path to a closed path as a list of line segments
     */
    circuit(path: Vector[], offset?: Vector, s?: number): Chainable

    /**
     * clear the draw area
     */
    clear(): void

    /**
     * set path to an elipse with the provided center, width, and height
     */
    ellipse(center: Vector, width: number, height: number, start?: number, stop?: number): Chainable

    /**
     * set the fill style to use in when filling a path
     * 
     * parsed as css color, the default is #000
     * 
     * affects drawing state
     */
    fillStyle(fill: string): void

    /**
     * draws text at (x, y), does not affect path
     * 
     * affected by setFont and textAlign
     */
    fillText(text: string, x: number, y: number): Chainable

    /**
     * retrieve the height of the drawable area
     */
    height(): number

    /**
     * set the LineCap to use for stroked lines
     * 
     * affects drawing state
     */
    lineCap(cap: LineCap): void

    /**
     * set the LineJoin to use for line joints for stroked lines
     * 
     * affects drawing state
     */
    lineJoin(join: LineJoin): void

    /**
     * add a straight line to the path
     */
    lineTo(x: number, y: number): Chainable

    /**
     * set the width of stroked lines
     * 
     * affects drawing state
     */
    lineWidth(width: number): void

    /**
     * retrieve rendered size information about the provided text
     */
    measureText(text: string): TextMetrics

    /**
     * begin a new sub-path at (x, y)
     */
    moveTo(x: number, y: number): void

    /**
     * set path to the provided points as a sequence of straight lines
     */
    path(points: Vector[]): Chainable

    /**
     * set path to a rectangle at (x, y) with the provided width and height
     */
    rect(x: number, y: number, width: number, height: number): Chainable

    /**
     * pops the top entry from the drawing state stack (does nothing if empty)
     * 
     * affects drawing state
     */
    restore(): void

    /**
     * set path to a rounded rectangle at (x, y) with the provided width, height, and radius
     */
    roundRect(x: number, y: number, width: number, height: number, radius: number): Chainable

    /**
     * pushes the current drawing state to the drawing state stack
     * 
     * affects drawing state
     */
    save(): void

    /**
     * apply a scaling transformation to the drawable area
     * by default, 1 is 1px. a negative value flips the axis.
     * 
     * affects drawing state
     */
    scale(x: number, y: number): void

    setData(name: string, value?: string): void

    /**
     * sets the font, parsed as a css font value
     * 
     * affects drawing state
     */
    setFont(family: string, size: number, weight: 'bold' | 'normal', style: 'italic' | 'normal'): void

    /**
     * set the line dash pattern
     * segments is an array of distances alternatively describing dashes and gaps, with empty representing a solid line
     * 
     * affects drawing state
     */
    setLineDash(segments: number[]): void

    /**
     * stroke the current path
     */
    stroke(): void

    /**
     * set the stroke style used when stroking a path
     * 
     * parsed as a css color, the default is #000
     * 
     * affects drawing state
     */
    strokeStyle(stroke: string): void

    /**
     * set the text alignment
     * 
     * text alignment is relative to the x value (i.e. it changes the origin respectively)
     * 
     * affects drawing state
     */
    textAlign(align: string): void

    /**
     * apply a translating transformation to the drawable area
     * 
     * affects drawing state
     */
    translate(dx: number, dy: number): void

    /**
     * retrieves the width of the drawable area
     */
    width(): number
}
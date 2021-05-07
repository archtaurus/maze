const WINDOW_WIDTH = 800
const WINDOW_HEIGHT = 800
const FRAMERATE = Infinity
const SEARCH_PER_FRAME = 1
const MAZE_ROWS = 40
const MAZE_COLS = 40
const MAZE_STONE_DENSITY = 0.3
const NODE_WIDTH = WINDOW_WIDTH / MAZE_COLS
const NODE_HEIGHT = WINDOW_HEIGHT / MAZE_ROWS
const BACKGROUND_COLOR = 'grey'
const NODE_COLOR_START = 'blue'
const NODE_COLOR_END = 'orange'
const NODE_COLOR_WALL = 'black'
const NODE_COLOR_CURRENT = 'purple'
const NODE_COLOR_UNVISITED = BACKGROUND_COLOR
const NODE_COLOR_STONE = BACKGROUND_COLOR
const PATH_COLOR_SEARCHING = 'yellow'
const PATH_COLOR_FINAL = 'red'
const VALUE_COLOR = 'white'
const VALUE_FONTSIZE = Math.min(NODE_WIDTH, NODE_HEIGHT) / 2
const WALL_LINE_WEIGHT = VALUE_FONTSIZE / 10
const PATH_LINE_WEIGHT = WALL_LINE_WEIGHT * 4
let gcost_max = 0
let maze_has_walls = true
let maze_has_stone = true
let maze
let running = true

function setup() {
    // noLoop()
    rectMode(CENTER)
    frameRate(FRAMERATE)
    textSize(VALUE_FONTSIZE)
    createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT)
    maze = new Maze(WINDOW_WIDTH, WINDOW_HEIGHT, MAZE_ROWS, MAZE_COLS)
}

function draw() {
    for (let _ = 0; _ < SEARCH_PER_FRAME; _++) maze.update()
    background(BACKGROUND_COLOR)
    strokeCap(PROJECT)
    textAlign(CENTER)
    maze.draw()
}

function mousePressed() {
    // 点击在画布范围以内
    if (mouseX >= 0 && mouseX < width && mouseY >= 0 && mouseY < height) {
        const x = Math.floor(mouseX / NODE_WIDTH)
        const y = Math.floor(mouseY / NODE_HEIGHT)
        const { g, h, f } = maze.grid[y][x]
        console.info(g, h, f)
    }
}

function keyPressed() {
    switch (key.toLowerCase()) {
        case ' ': {
            running = !running
            running ? loop() : noLoop()
            break
        }
        case 'g': {
            if (!isLooping()) redraw()
            break
        }
        case 'w': {
            maze_has_walls = !maze_has_walls
            maze = new Maze(WINDOW_WIDTH, WINDOW_HEIGHT, MAZE_ROWS, MAZE_COLS)
            running ? loop() : redraw()
            break
        }
        case 's': {
            maze_has_stone = !maze_has_stone
            maze = new Maze(WINDOW_WIDTH, WINDOW_HEIGHT, MAZE_ROWS, MAZE_COLS)
            running ? loop() : redraw()
            break
        }
        case 'r': {
            maze = new Maze(WINDOW_WIDTH, WINDOW_HEIGHT, MAZE_ROWS, MAZE_COLS)
            running ? loop() : redraw()
            break
        }
    }
}

class Node {
    constructor(row, col, width, height) {
        // 中心坐标
        this.row = row
        this.col = col
        const half_w = width / 2
        this.x = width * col + half_w
        const half_h = height / 2
        this.y = height * row + half_h
        this.width = width
        this.height = height

        // 四个角点坐标
        this.lt = { x: this.x - half_w + WALL_LINE_WEIGHT / 2, y: this.y - half_h + WALL_LINE_WEIGHT / 2 }
        this.rt = { x: this.x + half_w - WALL_LINE_WEIGHT / 2, y: this.y - half_h + WALL_LINE_WEIGHT / 2 }
        this.rb = { x: this.x + half_w - WALL_LINE_WEIGHT / 2, y: this.y + half_h - WALL_LINE_WEIGHT / 2 }
        this.lb = { x: this.x - half_w + WALL_LINE_WEIGHT / 2, y: this.y + half_h - WALL_LINE_WEIGHT / 2 }

        // A星算法数据
        this.g = Infinity
        this.h = Infinity
        this.f = Infinity
        this.from = null
        this.visited = false
        this.reachable = true
        this.neighbors = []
        this.walls = [maze_has_walls, maze_has_walls, maze_has_walls, maze_has_walls]
    }

    draw(color, value) {
        fill(color || 'red')
        this.reachable ? rect(this.x, this.y, this.width, this.height) : ellipse(this.x, this.y, this.width, this.height)
        if (value !== undefined) {
            fill(VALUE_COLOR)
            text(value, this.x, this.y + 4)
        }
        // 绘制墙体
        stroke(NODE_COLOR_WALL)
        strokeWeight(WALL_LINE_WEIGHT)
        if (this.walls[0]) line(this.lt.x, this.lt.y, this.rt.x, this.rt.y)
        if (this.walls[1]) line(this.rt.x, this.rt.y, this.rb.x, this.rb.y)
        if (this.walls[2]) line(this.rb.x, this.rb.y, this.lb.x, this.lb.y)
        if (this.walls[3]) line(this.lb.x, this.lb.y, this.lt.x, this.lt.y)
    }
}

class Maze {
    constructor(width, height, rows, cols) {
        this.width = width
        this.height = height
        this.rows = rows
        this.cols = cols

        // 初始化节点数组
        this.grid = new Array(rows)
        for (let row = 0; row < rows; row++) {
            this.grid[row] = new Array(cols)
            for (let col = 0; col < cols; col++) {
                this.grid[row][col] = new Node(row, col, width / cols, height / rows)
                if (maze_has_stone && row > 0 && row < rows - 1 && col > 0 && col < cols - 1 && Math.random() < MAZE_STONE_DENSITY)
                    this.grid[row][col].reachable = false
            }
        }
        // 设置起点终点
        this.start = this.grid[0][0]
        this.start.reachable = true
        this.end = this.grid[rows - 1][cols - 1]
        this.end.reachable = true

        // 待探索节点队列
        this.openset = new PriorityQueue()
        this.current = this.start
        this.current.g = 0
        this.current.h = this.dist(this.current, this.end)
        this.current.f = this.current.g + this.current.h
        this.current.visited = false
        this.current.open = true
        this.openset.enqueue(this.current, this.current.f)

        this.make_maze_depth_first_search_iterative()
    }

    get solved() {
        return this.current === this.end
    }

    get finised() {
        return this.openset.length === 0
    }

    dist(a, b) {
        if (maze_has_walls) return Math.abs(a.col - b.col) + Math.abs(a.row - b.row)
        else return dist(a.col, a.row, b.col, b.row)
    }

    update() {
        if (this.finised) noLoop()
        else {
            this.current = this.openset.dequeuemin()
            this.current.visited = true
            this.current.open = false
            if (this.solved) this.openset.clear()
            else {
                for (const neighbor of this.current.neighbors) {
                    if (neighbor.reachable && !neighbor.visited) {
                        const g = this.current.g + this.dist(this.current, neighbor)
                        if (g > gcost_max) gcost_max = g
                        if (g < neighbor.g) {
                            neighbor.from = this.current
                            neighbor.g = g
                            neighbor.h = this.dist(neighbor, this.end)
                            neighbor.f = neighbor.g + neighbor.h
                            if (!neighbor.open) neighbor.open = true
                            else this.openset.delete(neighbor)
                            this.openset.enqueue(neighbor, neighbor.f)
                        }
                    }
                }
            }
        }
    }

    draw() {
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                // 绘制节点
                noStroke()
                const node = this.grid[y][x]
                if (node === this.end) node.draw(NODE_COLOR_END, '终')
                else if (node === this.start) node.draw(NODE_COLOR_START, '起')
                else if (node === this.current) node.draw(NODE_COLOR_CURRENT, node.f.toFixed(0))
                else if (!node.reachable) node.draw(NODE_COLOR_STONE, '⛰️')
                else if (this.openset.length > 0 && node.open)
                    node.draw(
                        node.f === this.openset.min.f ? 'red' : color(map(node.f, this.openset.min.f, this.openset.max.f + 0.0000001, 200, 50), 0, 0),
                        node.f.toFixed(0)
                    )
                else if (node.visited) node.draw(color(0, map(node.g, 0, gcost_max, 100, 255), 0), node.g.toFixed(0))
                else node.draw(NODE_COLOR_UNVISITED)
            }
        }

        // 绘制路径
        if (this.solved) stroke(PATH_COLOR_FINAL)
        else stroke(PATH_COLOR_SEARCHING)
        strokeWeight(PATH_LINE_WEIGHT)
        let node = this.current
        noFill()
        beginShape()
        while (node) {
            vertex(node.x, node.y)
            node = node.from
        }
        endShape()
    }

    /**
     * 深度优先搜索（迭代实现）迷宫生成
     */
    make_maze_depth_first_search_iterative() {
        if (maze_has_walls) {
            // Choose the initial node, mark it as visited and push it to the stack
            let current = this.start
            current.mazeMakerVisited = true
            const nodesStack = [current]
            // While the stack is not empty
            while (nodesStack.length) {
                // Pop a node from the stack and make it a current node
                current = nodesStack.pop()
                // If the current node has any neighbours which have not been visited
                const neighbors = this.getUnvisitedNeighbors(current)
                if (neighbors.length) {
                    // Push the current node to the stack
                    nodesStack.push(current)
                    // Choose one of the unvisited neighbours
                    const index = Math.floor(Math.random() * neighbors.length)
                    const [neighbor, dir] = neighbors[index]
                    // Remove the wall between the current node and the chosen node
                    current.neighbors.push(neighbor)
                    neighbor.neighbors.push(current)
                    switch (dir) {
                        case 'up': {
                            current.walls[0] = false
                            neighbor.walls[2] = false
                            break
                        }
                        case 'right': {
                            current.walls[1] = false
                            neighbor.walls[3] = false
                            break
                        }
                        case 'down': {
                            current.walls[2] = false
                            neighbor.walls[0] = false
                            break
                        }
                        case 'left': {
                            current.walls[3] = false
                            neighbor.walls[1] = false
                            break
                        }
                    }
                    // Mark the chosen node as visited and push it to the stack
                    neighbor.mazeMakerVisited = true
                    nodesStack.push(neighbor)
                }
            }
        } else {
            for (let y = 0; y < this.rows; y++) {
                for (let x = 0; x < this.cols; x++) {
                    const node = this.grid[y][x]
                    if (x > 0) {
                        node.neighbors.push(this.grid[y][x - 1]) // 左边
                        if (y > 0) node.neighbors.push(this.grid[y - 1][x - 1]) // 左上
                        if (y < this.rows - 1) node.neighbors.push(this.grid[y + 1][x - 1]) // 左下
                    }
                    if (x < this.cols - 1) {
                        node.neighbors.push(this.grid[y][x + 1]) // 右边
                        if (y > 0) node.neighbors.push(this.grid[y - 1][x + 1]) // 右上
                        if (y < this.rows - 1) node.neighbors.push(this.grid[y + 1][x + 1]) // 右下
                    }
                    if (y > 0) {
                        node.neighbors.push(this.grid[y - 1][x]) // 上边
                    }
                    if (y < this.rows - 1) {
                        node.neighbors.push(this.grid[y + 1][x]) // 下边
                    }
                }
            }
        }
    }

    /**
     * 返回指定节点的邻近节点数组
     * @param {*} node
     * @returns {Array}
     */
    getUnvisitedNeighbors(node) {
        const row = node.row
        const col = node.col
        const neighbors = []
        if (row > 0) {
            const node = this.grid[row - 1][col]
            if (node.reachable && !node.mazeMakerVisited) neighbors.push([node, 'up'])
        }
        if (col < this.cols - 1) {
            const node = this.grid[row][col + 1]
            if (node.reachable && !node.mazeMakerVisited) neighbors.push([node, 'right'])
        }
        if (row < this.rows - 1) {
            const node = this.grid[row + 1][col]
            if (node.reachable && !node.mazeMakerVisited) neighbors.push([node, 'down'])
        }
        if (col > 0) {
            const node = this.grid[row][col - 1]
            if (node.reachable && !node.mazeMakerVisited) neighbors.push([node, 'left'])
        }
        return neighbors
    }
}

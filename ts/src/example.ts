const canvas = document.getElementById("canvas") as HTMLCanvasElement;

let blockSize: number = 20;

type Block = Readonly<'I' | 'O' | 'T' | 'J' | 'L' | 'S' | 'Z'>

type FieldValue = Block | ' '

type Tetromino = {
    width: number,
    height: number
    shape: FieldValue[][]
}

type TetrominoState = {
    position: Position
    tetromino: Tetromino | null
}

type Direction = "down" | "left" | "right" | "up";

type Position = { x: number, y: number }

class Board {
    readonly width: number = 10;
    readonly height: number = 20;

    readonly state: FieldValue[][] = [];

    generator = new TetrominoGenerator()

    position: Position = {x: 0, y: 0}

    tetromino: Tetromino | null = null

    constructor() {
        this.initializeBoard();
    }

    private initializeBoard(): void {
        for (let i = 0; i < this.width; i++) {
            this.state[i] = [];
            for (let j = 0; j < this.height; j++) {
                this.state[i][j] = ' ';
            }
        }
    }

    rotate() {
        if (!this.tetromino) {
            return
        }
        const shape = this.tetromino.shape
        const newTetromino = makeTetromino(
            rotateArray(shape)
        )
        if (!this.hasCollision({
            x: this.position.x,
            y: this.position.y
        }, newTetromino)) {
            this.tetromino = newTetromino;
        }
    }

    move(direction: Direction) {
        console.log(`${this.position}`);
        if (!this.tetromino || !this.canMove(direction)) {
            return
        }
        this.position = this.calculatePosition(direction);

        if (this.hasReachedBottom) {
            this.process(
                this.tetromino,
                (x, y, block) => {
                    this.state[x + this.position.x][y + this.position.y] = block
                }
            )
            this.spawnNextTetromino()
        }
    }

    private process(tetromino: Tetromino, action: (x: number, y: number, block: Block) => any) {
        for (let i = 0; i < tetromino.width; i++) {
            for (let j = 0; j < tetromino.height; j++) {
                let block = tetromino.shape[j][i];
                if (block !== ' ') {
                    action(i, j, block)
                }
            }
        }
    }

    private calculatePosition(direction: Direction, tetrominoState: TetrominoState = this.tetrominoState): Position {
        switch (direction) {
            case "up": { // HardDrop
                while (this.canMove('down', tetrominoState)) {
                    let {x, y} = this.calculatePosition('down', tetrominoState);
                    tetrominoState.position.x = x
                    tetrominoState.position.y = y
                }
                return {
                    y: tetrominoState.position.y,
                    x: tetrominoState.position.x
                }
            }
            case 'down':
                return {
                    y: tetrominoState.position.y + 1,
                    x: tetrominoState.position.x
                }
            case 'left':
                return {
                    y: tetrominoState.position.y,
                    x: tetrominoState.position.x - 1
                }
            case 'right':
                return {
                    y: tetrominoState.position.y,
                    x: tetrominoState.position.x + 1
                }
        }
    }

    draw(canvas: HTMLCanvasElement): void {
        canvas.width = this.width * blockSize;
        canvas.height = this.height * blockSize;
        const context = canvas.getContext("2d", {alpha: false})!;

        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                const block = this.state[j][i];
                if (block !== ' ') {
                    this.drawBlock(context, j, i, block)
                }
            }
        }

        let tetromino = this.tetrominoState.tetromino;
        if (tetromino) {
            this.process(
                tetromino,
                (x, y, block) => {
                    this.drawBlock(context, x + this.position.x, y + this.position.y, block)
                }
            )
        }

    }

    private drawBlock(context: CanvasRenderingContext2D, x: number, y: number, block: Block) {
        context.fillStyle = blockColors[block];
        context.fillRect(
            x * blockSize, // x
            y * blockSize, // y
            blockSize, // width
            blockSize  // height
        );
    }

    private canMove(direction: Direction, tetrominoState = this.tetrominoState): boolean {
        const tetromino = tetrominoState.tetromino
        if (!tetromino) {
            return false;
        }
        const position = this.calculatePosition(direction, tetrominoState)
        return (0 <= position.x && position.x + tetromino.width <= this.width) && // x
            (0 <= position.y && position.y + tetromino.height <= this.height) && // y
            !this.hasCollision(position);
    }

    hasCollision(newPosition: { x: number; y: number; }, tetromino = this.tetromino): boolean {
        if (!tetromino) {
            return false
        }

        let isBlocked = false
        this.process(
            tetromino,
            (x, y) => {
                isBlocked = isBlocked || this.state[newPosition.x + x][newPosition.y + y] !== ' '
            }
        )
        return isBlocked;
    }

    private get hasReachedBottom(): boolean {
        if (!this.tetromino) {
            return false
        }
        return !this.canMove('down')

    }

    get tetrominoState(): TetrominoState {
        return {
            position: this.position,
            tetromino: this.tetromino,
        }
    }

    spawnNextTetromino() {
        this.tetromino = this.generator.next()
        this.position = {x: 5, y: 0}
    }

    reset() {
        this.initializeBoard()
        this.generator = new TetrominoGenerator()
        this.spawnNextTetromino()
    }
}

function rotateArray(matrix: any[][]): any[] {
    let newMatrix: any[][] = [];

    for (let j = 0; j < matrix[0].length; j++) {
        newMatrix.push([]);
        for (let i = matrix.length - 1; i > -1; i--) {
            newMatrix[j].push(matrix[i][j]);
        }
    }
    return newMatrix;
}


class TetrominoGenerator {
    private unused: Tetromino[] = []

    next(): Tetromino {
        if (this.unused.length === 0) {
            this.unused = tetrominos
        }
        let next = this.chooseAtRandom(this.unused);
        this.unused = this.unused.filter(it => it !== next)
        return next
    }

    private chooseAtRandom(tetrominos: Tetromino[]): Tetromino {
        return tetrominos[Math.floor(Math.random() * tetrominos.length)]
    }
}

const board = new Board();
canvas.tabIndex = 0;
canvas.focus();
canvas.onkeydown = ({key}): void => {
    console.log(key);
    switch (key) {
        case 'ArrowDown':
            board.move('down');
            break;
        case 'ArrowLeft':
            board.move('left');
            break;
        case 'ArrowRight':
            board.move('right');
            break;
        case 'ArrowUp':
            board.move('up');
            break;
        case 'Escape':
            board.reset()
            break;
        case ' ':
            board.rotate()
            break;
        case '+':
            blockSize++
            break;
        case '-':
            blockSize--
            break;
    }
}
const O = makeTetromino(
    [
        ['O', 'O'],
        ['O', 'O']
    ],
)

const L = makeTetromino(
    [
        ['L', ' '],
        ['L', ' '],
        ['L', 'L'],
    ],
)

const J = makeTetromino(
    [
        [' ', 'J'],
        [' ', 'J'],
        ['J', 'J'],
    ],
)

const I = makeTetromino(
    [
        ['I', 'I', 'I', 'I'],
    ],
)

const T = makeTetromino(
    [
        ['T', 'T', 'T'],
        [' ', 'T', ' '],
    ],
)

const S = makeTetromino(
    [
        [' ', 'S', 'S'],
        ['S', 'S', ' '],
    ],
)

const Z = makeTetromino(
    [
        ['Z', 'Z', ' '],
        [' ', 'Z', 'Z'],
    ],
)

const blockColors: { [key in Block]: string } = {
    I: '#00F0F0',
    O: `#F0F000`,
    T: `#A000F0`,
    S: `#00F000`,
    Z: `#F00000`,
    J: `#0000F0`,
    L: `#F0A000`,
}

const tetrominos = [
    I,
    O,
    T,
    S,
    Z,
    J,
    L,
]

function makeTetromino(shape: FieldValue[][]): Tetromino {
    return {
        width: shape[0].length,
        height: shape.length,
        shape
    }
}

board.spawnNextTetromino();

let interval = setInterval(() => board.move('down'), 1000);

setInterval(() => board.draw(canvas), 1000 / 30);


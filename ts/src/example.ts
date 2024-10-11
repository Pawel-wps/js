const canvas = document.getElementById("canvas") as HTMLCanvasElement;

const blockSize: number = 10;

type Block = Readonly<'I' | 'O' | 'T' | 'J' | 'L' | 'S' | 'Z'>

type FieldValue = Block | ' '

type Tetromino = {
    width: number,
    height: number
    shape: FieldValue[][]
}

type TetrominoState = {
    x: number
    y: number
    tetromino: Tetromino | null
}

type Direction = "down" | "left" | "right" | "up";

class Board {
    readonly width: number = 10;
    readonly height: number = 20;

    readonly state: FieldValue[][] = [];

    generator = new TetrominoGenerator()

    readonly tetrominoState: TetrominoState = {
        x: 0,
        y: 0,
        tetromino: null
    }

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

    move(direction: Direction) {
        console.log(`${this.tetrominoState.x},${this.tetrominoState.y}`);
        if (!this.tetromino || !this.canMove(direction)) {
            return
        }
        const {x, y} = this.calculatePosition(direction);
        this.tetrominoState.x = x
        this.tetrominoState.y = y

        if (this.hasReachedBottom) {
            this.process(
                this.tetromino,
                (x, y, block) => {
                    this.state[x + this.tetrominoState.x][y + this.tetrominoState.y] = block
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

    private calculatePosition(direction: Direction, tetrominoState: TetrominoState = this.tetrominoState): {
        x: number,
        y: number
    } {
        switch (direction) {
            case "up": {
                while (this.canMove('down', tetrominoState)) {
                    let {x, y} = this.calculatePosition('down', tetrominoState);
                    tetrominoState.x = x
                    tetrominoState.y = y
                }
                return {
                    y: tetrominoState.y,
                    x: tetrominoState.x
                }
            }
            case 'down':
                return {
                    y: tetrominoState.y + 1,
                    x: tetrominoState.x
                }
            case 'left':
                return {
                    y: tetrominoState.y,
                    x: tetrominoState.x - 1
                }
            case 'right':
                return {
                    y: tetrominoState.y,
                    x: tetrominoState.x + 1
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
                    this.drawBlock(context, x + this.tetrominoState.x, y + this.tetrominoState.y, block)
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

    add(tetromino: Tetromino, x: number, y: number) {
        this.tetrominoState.tetromino = tetromino;
        this.tetrominoState.x = x;
        this.tetrominoState.y = y;
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

    hasCollision(newPosition: { x: number; y: number; }): boolean {
        if (!this.tetromino) {
            return false
        }

        let isBlocked = false
        this.process(
            this.tetromino,
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

    private get tetromino() {
        return this.tetrominoState.tetromino
    }

    spawnNextTetromino() {
        this.tetrominoState.tetromino = this.generator.next()
        this.tetrominoState.x = 5;
        this.tetrominoState.y = 0;
    }

    reset() {
        this.initializeBoard()
        this.generator = new TetrominoGenerator()
        this.spawnNextTetromino()
    }
}

class TetrominoGenerator {
    private unused: Tetromino[] = []

    next(): Tetromino {
        if (this.unused.length === 0) {
            this.unused = Object.values(tetrominos)
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

const blockColors: {[key in Block]: string} = {
    I: '#00F0F0',
    O: `#F0F000`,
    T: `#A000F0`,
    S: `#00F000`,
    Z: `#F00000`,
    J: `#0000F0`,
    L: `#F0A000`,
}

const tetrominos: {[key in Block]: Tetromino} = {
    I,
    O,
    T,
    S,
    Z,
    J,
    L,
}

function makeTetromino(shape: FieldValue[][]): Tetromino {
    return {
        width: shape[0].length,
        height: shape.length,
        shape
    }
}

board.add(L, 5, 0);

setInterval(() => board.draw(canvas), 1000 / 30);


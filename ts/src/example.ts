const canvas = document.getElementById("canvas") as HTMLCanvasElement;

const blockSize: number = 10;

type Tetromino = {
    width: number,
    height: number
    shape: ('o' | 'x')[][]
}

type TetrominoState = {
    x: number
    y: number
    tetromino: Tetromino | null
}

class Board {
    readonly width: number = 10;
    readonly height: number = 20;

    readonly state: ('x' | 'o')[][] = [];

    readonly tetrominoState: TetrominoState = {
        x: 0,
        y: 0,
        tetromino: null
    }

    constructor() {
        this.initializeBoard();
    }


    private initializeBoard(): void {
        for (let i = 0; i < this.height; i++) {
            this.state[i] = [];
            for (let j = 0; j < this.width; j++) {
                this.state[i][j] = 'o';
            }
        }
    }

    move(direction: 'down' | 'left' | 'right') {
        console.log(`${this.tetrominoState.x},${this.tetrominoState.y}`);
        if (!this.tetromino || !this.canMove(direction)) {
            return
        }
        const {x, y} = this.calculatePosition(direction);
        this.tetrominoState.x = x
        this.tetrominoState.y = y

        if (this.hasReachedBottom) {
            for (let i = 0; i < this.tetromino.width; i++) {
                for (let j = 0; j < this.tetromino.height; j++) {
                    if (this.tetromino.shape[j][i] === 'x') {
                        this.state[j + this.tetrominoState.x][i + this.tetrominoState.y] = 'x'
                    }
                }
            }
            this.reset()
        }
    }

    private calculatePosition(direction: "down" | "left" | "right"): { x: number, y: number } {
        switch (direction) {
            case 'down':
                return {
                    y: this.tetrominoState.y + 1,
                    x: this.tetrominoState.x
                }

            case 'left':
                return {
                    y: this.tetrominoState.y,
                    x: this.tetrominoState.x - 1
                }
            case 'right':
                return {
                    y: this.tetrominoState.y,
                    x: this.tetrominoState.x + 1
                }
        }
    }

    draw(canvas: HTMLCanvasElement): void {
        canvas.width = this.width * blockSize;
        canvas.height = this.height * blockSize;
        const context = canvas.getContext("2d", {alpha: false})!;

        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                if (this.state[j][i] === 'x') {
                    this.drawBlock(context, j, i)
                }
            }
        }

        let tetromino = this.tetrominoState.tetromino;
        if (tetromino) {
            for (let i = 0; i < tetromino.width; i++) {
                for (let j = 0; j < tetromino.height; j++) {
                    if (tetromino.shape[i][j] === 'x') {
                        this.drawBlock(context, j + this.tetrominoState.x, i + this.tetrominoState.y)
                    }
                }
            }
        }

    }

    private drawBlock(context: CanvasRenderingContext2D, x: number, y: number) {
        context.fillStyle = "#03c2ca";
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


    private canMove(direction: "down" | "left" | "right"): boolean {
        if (!this.tetromino) {
            return false;
        }
        const position = this.calculatePosition(direction)
        return (0 <= position.x && position.x + this.tetromino.width <= this.width) &&
            (0 <= position.y && position.y + this.tetromino.height <= this.height);
    }

    private get hasReachedBottom(): boolean {
        if (!this.tetromino) {
            return false
        }
        return this.tetrominoState.y + this.tetromino.height >= this.height
    }

    private get tetromino() {
        return this.tetrominoState.tetromino
    }

    reset() {
        this.tetrominoState.x = 5;
        this.tetrominoState.y = 0;
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
        case 'Escape':
            board.reset()
    }
}
const square: Tetromino = {
    width: 2,
    height: 2,
    shape: [
        ['x', 'x'],
        ['x', 'x']
    ],
}


board.add(square, 5, 0);

setInterval(() => board.draw(canvas), 1000 / 30);


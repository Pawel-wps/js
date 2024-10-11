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
        if (!this.tetrominoState.tetromino) {
            return
        }
        switch (direction) {
            case 'down': this.tetrominoState.y++; break
            case 'left': this.tetrominoState.x--; break
            case 'right': this.tetrominoState.x++; break
        }
    }

    draw(canvas: HTMLCanvasElement):void {
        canvas.width = this.width * blockSize;
        canvas.height = this.height * blockSize;
        const context = canvas.getContext("2d", { alpha: false })!;

        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                if (this.state[i][j] === 'x'){
                    this.drawBlock(context, j, i)
                }
            }
        }

        let tetromino = this.tetrominoState.tetromino;
        if (tetromino) {
            for (let i = 0; i < tetromino.width; i++) {
                for (let j = 0; j < tetromino.height; j++) {
                    if (tetromino.shape[i][j] === 'x'){
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
}

const board = new Board();

board.tetrominoState.tetromino = {
    width: 2,
    height: 2,
    shape: [
        ['x','x'],
        ['x','x']
    ]
}
canvas.tabIndex = 0;
canvas.focus();
canvas.onkeydown = ({key}): void => {
    switch (key) {
        case 'ArrowDown': board.move('down'); break;
        case 'ArrowLeft': board.move('left'); break;
        case 'ArrowRight': board.move('right'); break;
    }
}

setInterval(() => board.draw(canvas), 1000 / 30);


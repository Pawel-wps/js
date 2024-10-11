const canvas = document.getElementById("canvas") as HTMLCanvasElement;

const blockSize: number = 10;

class Board {
    readonly width: number = 10;
    readonly height: number = 20;

    readonly state: ('x' | 'o')[][] = [];

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

    draw(canvas: HTMLCanvasElement):void {
        canvas.width = this.width * blockSize;
        canvas.height = this.height * blockSize;
        const context = canvas.getContext("2d", { alpha: false })!;

        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                if (this.state[i][j] === 'x'){
                    context.fillStyle = "#03c2ca";
                    context.fillRect(
                        j * blockSize, // x
                        i * blockSize, // y
                        blockSize, // width
                        blockSize  // height
                    );
                }
            }
        }
    }
}

const board = new Board();

board.state[10][5] = 'x';

board.draw(canvas);


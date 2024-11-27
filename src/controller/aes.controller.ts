export function createState(input: string): number[][] {
    const state: number[][] = [];
    const paddedInput = input.padEnd(16, '\0') //relleno con \0 si es menor que 16 bytes
    for (let i = 0; i < 4; i++) {
        state[i] = [];
        for (let j = 0; j < 4; j++) {
            state[i][j] = paddedInput.charCodeAt(i * 4 + j);
        }
    }

    return state;
};
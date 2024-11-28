import { GALOISX11, GALOISX13, GALOISX14, GALOISX2, GALOISX3, GALOISX9, INVMATCONSTANT, INVSBOX } from "./constants.controller.js";

export function inverseSubBytes(state: number[][]): number[][] {
    const newState: number[][] = [];
    for (let i = 0; i < 4; i++) {
        newState[i] = [];
        for (let j = 0; j < 4; j++) {
            const byte = state[i][j];
            const rowDigit = byte >> 4;
            const columnDigit = byte & 0x0f;
            newState[i][j] = INVSBOX[rowDigit][columnDigit];
        }
    }
    return newState;
};


export function inverseShiftRows(state: number[][]): number[][] {
    const newState: number[][] = [];
    for (let i = 0; i < 4; i++) {
        newState[i] = [];
        for (let j = 0; j < 4; j++) {
            newState[i][(j + i) % 4] = state[i][j];
        }
    }
    return newState;
}


export function inverseMixColumns(state: number[][]): number[][] {
    const newState: number[][] = [];
    for (let col = 0; col < 4; col++) {
        const originalColumn = state.map(row => row[col]);
        const newColumn = [0, 0, 0, 0];

        for (let i = 0; i < 4; i++) {
            newColumn[i] = INVMATCONSTANT[i].reduce((acc, multiplier, index) => {
                const value = originalColumn[index];
                if (multiplier === 1) return acc ^ value;
                if (multiplier === 2) return acc ^ GALOISX2[value];
                if (multiplier === 3) return acc ^ GALOISX3[value];
                if (multiplier === 9) return acc ^ GALOISX9[value];
                if (multiplier === 11) return acc ^ GALOISX11[value];
                if (multiplier === 13) return acc ^ GALOISX13[value];
                if (multiplier === 14) return acc ^ GALOISX14[value];
                return acc;
            }, 0);
        }

        for (let row = 0; row < 4; row++) {
            if (!newState[row]) newState[row] = [];
            newState[row][col] = newColumn[row];
        }
    }

    return newState;
};
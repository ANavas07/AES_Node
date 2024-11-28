import { addRoundKey } from "./aes.controller.js";
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
                const highNibble = value >> 4; // Parte alta (4 bits más significativos)
                const lowNibble = value & 0x0f; // Parte baja (4 bits menos significativos)
                if (multiplier === 1) return acc ^ value; // Multiplicador 1: XOR directo
                if (multiplier === 2) return acc ^ GALOISX2[highNibble][lowNibble]; // Multiplicador 2
                if (multiplier === 3) return acc ^ GALOISX3[highNibble][lowNibble]; // Multiplicador 3
                if (multiplier === 9) return acc ^ GALOISX9[highNibble][lowNibble]; // Multiplicador 9
                if (multiplier === 11) return acc ^ GALOISX11[highNibble][lowNibble]; // Multiplicador 11
                if (multiplier === 13) return acc ^ GALOISX13[highNibble][lowNibble]; // Multiplicador 13
                if (multiplier === 14) return acc ^ GALOISX14[highNibble][lowNibble]; // Multiplicador 14
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

export function aesDecrypt(ciphertext: number[][][], roundKeys: number[][][]): number[][][] {
    // Aplicar ADDROUNDKEY inicial (última clave de ronda)
    let state = ciphertext.map(block => addRoundKey(block, roundKeys[10]));

    // Rondas 9 a 1
    for (let round = 9; round >= 1; round--) {
        state = state.map(block => {
            block = inverseShiftRows(block); // Inverse ShiftRows
            block = inverseSubBytes(block); // Inverse SubBytes
            block = addRoundKey(block, roundKeys[round]); // AddRoundKey
            return inverseMixColumns(block); // Inverse MixColumns
        });
    }

    // Última ronda (sin Inverse MixColumns)
    state = state.map(block => {
        block = inverseShiftRows(block); // Inverse ShiftRows
        block = inverseSubBytes(block); // Inverse SubBytes
        return addRoundKey(block, roundKeys[0]); // AddRoundKey inicial
    });

    return state;
}

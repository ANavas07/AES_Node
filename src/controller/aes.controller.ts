import { GALOISX2, GALOISX3, MATCONSTANT, SBOX } from "./constants.controller.js";

/**
 * Crea la matriz de estado 4x4 para AES a partir de una cadena.
 * @param input Cadena de texto (mensaje o clave).
 * @param asHex Si es `true`, convierte los valores en hexadecimal.
 * @returns Matriz 4x4 que representa el estado inicial.
 * Trabajo en decimal ya que es más fácil de trabajar al momento de pasar a binario para operaciones XOR.
 */
export function createState(input: string): number[][] {
    const paddedInput = input.padEnd(16, '\0'); // Relleno para un único bloque de 16 bytes
    const state: number[][] = [];

    for (let i = 0; i < 4; i++) {
        state[i] = [];//crea una nueva fila
        for (let j = 0; j < 4; j++) {
            const byte = paddedInput.charCodeAt(i * 4 + j);
            state[i][j] = byte;
        }
    }

    return state;
}

/**
 * Crea la matriz de estado 4x4 para AES a partir de una cadena.
 * @param input Cadena de texto (mensaje o clave).
 * @param asHex Si es `true`, convierte los valores en hexadecimal.
 * @returns Matriz 4x4 que representa el estado inicial.
 * Matriz en decimal ya que es más fácil de trabajar al momento de pasar a binario para operaciones XOR.
 */
export function createStates(input: string): number[][][] {

    const states: number[][][] = [];
    const paddedInput = input.padEnd(Math.ceil(input.length / 16) * 16, '\0'); // Relleno con '\0' si es menor que 16 bytes

    for (let blockStart = 0; blockStart < paddedInput.length; blockStart += 16) {
        const state: number[][] = [];//crea una nueva fila
        const block = paddedInput.slice(blockStart, blockStart + 16); // Extraer bloque de 16 bytes

        for (let i = 0; i < 4; i++) {
            state[i] = [];
            for (let j = 0; j < 4; j++) {
                const byte = block.charCodeAt(i * 4 + j);
                state[i][j] = byte;
            }
        }
        states.push(state);
    }
    return states;
};

/**
 * Realiza AddRoundKey en un bloque de estado 4x4.
 * @param state Matriz 4x4 que representa el estado del mensaje.
 * @param key Matriz 4x4 que representa la clave.
 * @returns Nuevo estado después de aplicar AddRoundKey, este estado devuelvo en hexadecimal para subytes.
 */
export function addRoundKey(state: number[][], key: number[][]): string[][] {
    const newState: string[][] = [];
    for (let i = 0; i < 4; i++) {
        newState[i] = [];//crea una nueva fila
        for (let j = 0; j < 4; j++) {
            const result = state[i][j] ^ key[i][j]; //^ OPERADOR XOR -> o necesito pasarlo a binario ya que opera a nivel de bits
            newState[i][j] = result.toString(16).padStart(2, '0'); // convierto a hexadecimal
        }
    }
    return newState;
};

/**
 * 
 * @param stateRoundKey Matriz 4x4 obtenida de la función addRoundKey
 * @returns Matriz de la interseccion con la SBOX
 */
export function subBytes(stateRoundKey: string[][]): string[][] {
    const newState: string[][] = [];
    for (let i = 0; i < 4; i++) {
        newState[i] = []; //crea una nueva fila
        for (let j = 0; j < 4; j++) {
            const byte = stateRoundKey[i][j]; //obtengo el byte
            const rowDigit = parseInt(byte[0], 16); //obtengo el primer digito
            const columnDigit = parseInt(byte[1], 16); //obtengo el segundo digito
            newState[i][j] = SBOX[rowDigit][columnDigit].toString(16).padStart(2, '0');
        }
    }

    return newState;
};


export function shiftRows(subBytesMat: string[][]): string[][] {
    const newState: string[][] = [];
    for (let i = 0; i < 4; i++) {
        newState[i] = [];
        for (let j = 0; j < 4; j++) {
            newState[i][j] = subBytesMat[i][(j + i) % 4];
        }
    }
    return newState;
}

export function mixColumns(shiftRowsMat: string[][]): string[][] {
    const newState: string[][] = [];
    for (let col = 0; col < 4; col++) { //col-> notacion para extraer la columna de la matriz constante
        //obtengo los valores de la columna actual
        const originalColumn = shiftRowsMat.map(row => row[col], 16);
        const newColumn = [0, 0, 0, 0];

        for (let i = 0; i < 4; i++) {
            newColumn[i] = MATCONSTANT[i].reduce((acc, multiplier, index) => {
                const value: any = originalColumn[index];
                if (multiplier === 1) return acc ^ value;
                if (multiplier === 2) return acc ^ GALOISX2[value >> 4][value & 0x0f]; //Divide el byte (value) en su parte alta (value >> 4) y su parte baja (value & 0x0f).
                if (multiplier === 3) return acc ^ GALOISX3[value >> 4][value & 0x0f]; // se usa para buscar el valor en la tabla de Galois
                return acc;
            }, 0);
        }

        // Guardamos la nueva columna en el estado
        for (let row = 0; row < 4; row++) {
            if (!newState[row]) newState[row] = [];
            newState[row][col] = newColumn[row].toString(16).padStart(2, '0');
        }
    }

    return newState;
}
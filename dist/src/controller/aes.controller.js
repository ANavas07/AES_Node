import { GALOISX2, GALOISX3, MATCONSTANT, SBOX } from "./constants.controller.js";
/**
 * Crea la matriz de estado 4x4 para AES a partir de una cadena.
 * @param input Cadena de texto (mensaje o clave).
 * @param asHex Si es `true`, convierte los valores en hexadecimal.
 * @returns Matriz 4x4 que representa el estado inicial.
 * Trabajo en decimal ya que es más fácil de trabajar al momento de pasar a binario para operaciones XOR.
 */
export function createState(input) {
    const paddedInput = input.padEnd(16, '\0'); // Relleno para un único bloque de 16 bytes
    const state = [];
    for (let i = 0; i < 4; i++) {
        state[i] = []; //crea una nueva fila
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
export function createStates(input) {
    const states = [];
    const paddedInput = input.padEnd(Math.ceil(input.length / 16) * 16, '\0'); // Relleno con '\0' si es menor que 16 bytes
    for (let blockStart = 0; blockStart < paddedInput.length; blockStart += 16) {
        const state = []; //crea una nueva fila
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
}
;
/**
 * Realiza AddRoundKey en un bloque de estado 4x4.
 * @param state Matriz 4x4 que representa el estado del mensaje.
 * @param key Matriz 4x4 que representa la clave.
 * @returns Nuevo estado después de aplicar AddRoundKey, este estado devuelvo en hexadecimal para subytes.
 */
export function addRoundKey(state, key) {
    const newState = [];
    for (let i = 0; i < 4; i++) {
        newState[i] = []; //crea una nueva fila
        for (let j = 0; j < 4; j++) {
            const result = state[i][j] ^ key[i][j]; //^ OPERADOR XOR -> o necesito pasarlo a binario ya que opera a nivel de bits
            newState[i][j] = result.toString(16).padStart(2, '0'); // convierto a hexadecimal
        }
    }
    return newState;
}
;
/**
 *
 * @param stateRoundKey Matriz 4x4 obtenida de la función addRoundKey
 * @returns Matriz de la interseccion con la SBOX
 */
export function subBytes(stateRoundKey) {
    const newState = [];
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
}
;
export function shiftRows(subBytesMat) {
    const newState = [];
    for (let i = 0; i < 4; i++) {
        newState[i] = [];
        for (let j = 0; j < 4; j++) {
            newState[i][j] = subBytesMat[i][(j + i) % 4];
        }
    }
    return newState;
}
export function mixColumns(shiftRowsMat) {
    const newState = [];
    for (let col = 0; col < 4; col++) { //col-> notacion para extraer la columna de la matriz constante
        //obtengo los valores de la columna actual
        const originalColumn = shiftRowsMat.map(row => row[col], 16);
        const newColumn = [0, 0, 0, 0];
        for (let i = 0; i < 4; i++) {
            newColumn[i] = MATCONSTANT[i].reduce((acc, multiplier, index) => {
                const value = originalColumn[index];
                if (multiplier === 1)
                    return acc ^ value;
                if (multiplier === 2)
                    return acc ^ GALOISX2[value >> 4][value & 0x0f]; //Divide el byte (value) en su parte alta (value >> 4) y su parte baja (value & 0x0f).
                if (multiplier === 3)
                    return acc ^ GALOISX3[value >> 4][value & 0x0f]; // se usa para buscar el valor en la tabla de Galois
                return acc;
            }, 0);
        }
        // Guardamos la nueva columna en el estado
        for (let row = 0; row < 4; row++) {
            if (!newState[row])
                newState[row] = [];
            newState[row][col] = newColumn[row].toString(16).padStart(2, '0');
        }
    }
    return newState;
}
;
export function generateRoundKeys(initialKey) {
    const RCON = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36]; // Constantes de ronda
    const roundKeys = [initialKey.map(row => [...row])]; //Clave incial  como primer elemento
    for (let round = 1; round < 11; round++) {
        const prevKey = roundKeys[round - 1];
        const newKey = [[], [], [], []];
        //Primera palabra de la clave
        const lastColumn = prevKey.map(row => row[3]);
        const rotated = [...lastColumn.slice(1), lastColumn[0]]; //Rotword
        const subWord = rotated.map(byte => subBytes([[byte]])[0][0]); //SubBytes
        const rconXOR = (parseInt(subWord[0], 16) ^ RCON[round - 1]).toString(16).padStart(2, '0'); //Rcon XOR
        newKey[0][0] = rconXOR;
        for (let i = 1; i < 4; i++) {
            newKey[i][0] = (parseInt(subWord[i], 16) ^ parseInt(prevKey[i][0], 16)).toString(16).padStart(2, '0');
        }
        ;
        // Otras palabras
        for (let col = 1; col < 4; col++) {
            for (let row = 0; row < 4; row++) {
                newKey[row][col] = (parseInt(newKey[row][col - 1], 16) ^ parseInt(prevKey[row][col], 16)).toString(16).padStart(2, '0');
            }
            ;
        }
        ;
        roundKeys.push(newKey);
    }
    ;
    return roundKeys;
}
;
//# sourceMappingURL=aes.controller.js.map
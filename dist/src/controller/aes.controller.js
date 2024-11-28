import { GALOISX2, GALOISX3, MATCONSTANT, SBOX } from "./constants.controller.js";
/**
 * Crea la matriz de estado 4x4 para AES a partir de una cadena.
 * @param input Cadena de texto (mensaje o clave).
 * @param asHex Si es `true`, convierte los valores en hexadecimal.
 * @returns Matriz 4x4 que representa el estado inicial.
 * Trabajo en decimal ya que es más fácil de trabajar al momento de pasar a binario para operaciones XOR.
 */
export function createState(input) {
    const paddedInput = input.padEnd(16, '\0');
    const state = [];
    for (let i = 0; i < 4; i++) {
        state[i] = [];
        for (let j = 0; j < 4; j++) {
            const byte = paddedInput.charCodeAt(i * 4 + j);
            state[i][j] = byte; // Mantén en decimal
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
            ;
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
            newState[i][j] = result; // convierto a hexadecimal
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
        newState[i] = []; // Crea una nueva fila
        for (let j = 0; j < 4; j++) {
            const byte = stateRoundKey[i][j]; // Obtengo el byte en decimal
            const rowDigit = byte >> 4; // Parte alta del byte (primer dígito)
            const columnDigit = byte & 0x0f; // Parte baja del byte (segundo dígito)
            newState[i][j] = SBOX[rowDigit][columnDigit]; // Busca en la S-Box y convierte a decimal
        }
    }
    return newState;
}
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
            newState[row][col] = newColumn[row];
        }
    }
    return newState;
}
;
export function generateRoundKeys(initialKey) {
    const RCON = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36]; // Constantes de ronda
    const roundKeys = [initialKey.map(row => [...row])]; //Clave incial  como primer elemento
    //generacion de claves para cada ronda
    for (let round = 1; round < 11; round++) {
        const prevKey = roundKeys[round - 1]; //recupera las claves de la ronda anterior
        const newKey = [[], [], [], []]; //matriz 4x4 para la nueva clave
        //Primera palabra de la clave
        const lastColumn = prevKey.map(row => row[3]); //ultima columna de la clave anterior. Esta columna se transformará para generar la primera palabra de la nueva clave.
        const rotated = [...lastColumn.slice(1), lastColumn[0]]; //Rotword
        //Adentro de subWord esta subBytes de forma directa
        const subWord = rotated.map(byte => {
            const rowDigit = byte >> 4; // Parte alta del byte
            const columnDigit = byte & 0x0f; // Parte baja del byte
            return SBOX[rowDigit][columnDigit]; // Busca directamente en la S-Box
        }); //SubBytes aplicado a cada byte del resultado
        const rconXOR = subWord[0] ^ RCON[round - 1]; //Rcon XOR
        //Calcular los bytes de la primera palabra
        newKey[0][0] = rconXOR;
        for (let i = 1; i < 4; i++) {
            //XOR entre el byte correspondiente de subWord y el byte de la columna de clave anterior
            newKey[i][0] = subWord[i] ^ prevKey[i][0];
        }
        ;
        // Otras palabras
        for (let col = 1; col < 4; col++) {
            for (let row = 0; row < 4; row++) {
                newKey[row][col] = newKey[row][col - 1] ^ prevKey[row][col];
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
/**
 * Realiza el cifrado AES completo en bloques.
 * @param message Matriz de estado dividida en bloques (4x4 cada bloque).
 * @param roundKeys Claves generadas para cada ronda (11 claves).
 * @returns Matriz cifrada (bloques transformados).
 */
export function aesEncrypt(message, roundKeys) {
    //Aplicar ADDROUNDKEY inicial
    let state = message.map((block, index) => addRoundKey(block, roundKeys[0]));
    //Rondas 1 a 9
    for (let round = 1; round <= 9; round++) {
        state = state.map((block) => {
            block = subBytes(block);
            block = shiftRows(block);
            block = mixColumns(block);
            return addRoundKey(block, roundKeys[round]);
        });
    }
    // Última ronda (sin MixColumns)
    state = state.map((block) => {
        block = subBytes(block); // SubBytes
        block = shiftRows(block); // ShiftRows
        return addRoundKey(block, roundKeys[10]); // AddRoundKey final
    });
    return state;
}
export function hexToDecimalMatrix(hexMatrix) {
    return hexMatrix.map(row => row.map(byte => parseInt(byte, 16)));
}
export function formatEncryptedMessage(message) {
    return message
        .map(block => block.map(row => row.map(byte => byte.toString(16).padStart(2, '0')).join('')).join('')).join('');
}
//# sourceMappingURL=aes.controller.js.map
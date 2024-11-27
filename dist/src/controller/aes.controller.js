import { S_BOX } from "./constants.controller.js";
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
 * @returns Matriz de la interseccion con la S_BOX
 */
export function subBytes(stateRoundKey) {
    const newState = [];
    for (let i = 0; i < 4; i++) {
        newState[i] = []; //crea una nueva fila
        for (let j = 0; j < 4; j++) {
            const byte = stateRoundKey[i][j]; //obtengo el byte
            const rowDigit = parseInt(byte[0], 16); //obtengo el primer digito
            const columnDigit = parseInt(byte[1], 16); //obtengo el segundo digito
            newState[i][j] = S_BOX[rowDigit][columnDigit].toString(16).padStart(2, '0');
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
//# sourceMappingURL=aes.controller.js.map
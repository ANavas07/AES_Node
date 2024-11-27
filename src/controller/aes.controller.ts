
/**
 * Crea la matriz de estado 4x4 para AES a partir de una cadena.
 * @param input Cadena de texto (mensaje o clave).
 * @param asHex Si es `true`, convierte los valores en hexadecimal.
 * @returns Matriz 4x4 que representa el estado inicial.
 */
export function createState(input: string, asHex:boolean=false): string[][] |number[][] {
    const state: number[][] | string[][] = [];
    const paddedInput = input.padEnd(16, '\0') //relleno con \0 si es menor que 16 bytes
    for (let i = 0; i < 4; i++) {
        state[i] = [];
        for (let j = 0; j < 4; j++) {
            const byte= paddedInput.charCodeAt(i * 4 + j);
            state[i][j] = asHex ? byte.toString(16).padStart(2, '0') : byte;
        }
    }

    return state;
};


/**
 * Crea la matriz de estado 4x4 para AES a partir de una cadena.
 * @param input Cadena de texto (mensaje o clave).
 * @param asHex Si es `true`, convierte los valores en hexadecimal.
 * @returns Matriz 4x4 que representa el estado inicial.
 */
export function createState(input: string, asHex: boolean = false): string[][] | number[][] {
    const states:any= [];
    const paddedInput = input.padEnd(Math.ceil(input.length / 16) * 16, '\0'); // Relleno con '\0' si es menor que 16 bytes

    for (let blockStart = 0; blockStart < paddedInput.length; blockStart += 16) {
        const state:any= [];
        const block = paddedInput.slice(blockStart, blockStart + 16); // Extraer bloque de 16 bytes

        for (let i = 0; i < 4; i++) {
            state[i] = [];
            for (let j = 0; j < 4; j++) {
                const byte = block.charCodeAt(i * 4 + j);
                state[i][j] = asHex ? byte.toString(16).padStart(2, '0') : byte;
            }
        }
        states.push(state);
    }


    return states;
}

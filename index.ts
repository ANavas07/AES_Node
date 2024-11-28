import readline from 'readline';
import {aesEncrypt, createState, createStates, formatEncryptedMessage, generateRoundKeys } from './src/controller/aes.controller.js';


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Ingresa un mensaje a encriptar: ', (message) => {
    console.log(`El mensaje ingresado es: ${message}`);

    //Clave 
    const aesKey: string = 'CaizaAesKey12345';
    if (aesKey.length < 16) {
        console.log('La clave debe tener 16 caracteres');
        rl.close();
    };
    const keyState = createState(aesKey);
    const roundKeys = generateRoundKeys(keyState); //Genero claves de las rondas
    const messageState = createStates(message); // bloques de los estados del mensaje
    const encryptedMessage = aesEncrypt(messageState, roundKeys);

    const encryptedHex = formatEncryptedMessage(encryptedMessage);
    console.log("Mensaje cifrado en decimal:", encryptedMessage);
    console.log("Mensaje cifrado en hexadecimal:", encryptedHex);

    rl.close();
});



// // messageState.forEach((state, index)=>{
// //     console.log(`Bloque ${index+1}`, state)
// // });
// const finalStates = messageState.map((state) => addRoundKey(state, keyState));
// // finalStates.forEach((finalState, index) => {
// //     console.log(`Bloque ${index + 1} (después de AddRoundKey, hexadecimal):`, finalState);
// // });
// const subBytesMatrix = finalStates.map((state) => subBytes(state));
// // subBytesMatrix.forEach((state, index) => {
// //     console.log(`Bloque ${index + 1} (después de SubBytes, hexadecimal):`, state);
// // });
// console.log("--------------------");
// const shiftRowsMatrix = subBytesMatrix.map((state) => shiftRows(state));
// // shiftRowsMatrix.forEach((state, index) => {
// //     console.log(`Bloque ${index + 1} (después de ShiftRows, hexadecimal):`, state);
// // });
// const mixedMatrix = shiftRowsMatrix.map((state) => mixColumns(state));
// mixedMatrix.forEach((state, index) => {
//     console.log(`Bloque ${index + 1} (después de MixColumns, hexadecimal):`, state);
// });
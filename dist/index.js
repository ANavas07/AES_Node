import readline from 'readline';
import { createState } from './src/controller/aes.controller.js';
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
rl.question('Ingresa un mensaje a encriptar: ', (message) => {
    console.log(`El mensaje ingresado es: ${message}`);
    const lola = createState(message);
    console.log(lola);
    rl.close();
});
//# sourceMappingURL=index.js.map
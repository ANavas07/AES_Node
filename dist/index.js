import readline from 'readline';
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
rl.question('Ingresa un mensaje a encriptar: ', (message) => {
    console.log(`El mensaje ingresado es: ${message}`);
    rl.close();
});
//# sourceMappingURL=index.js.map
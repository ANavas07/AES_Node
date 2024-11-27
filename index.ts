import readline from 'readline';
import { createState} from './src/controller/aes.controller.js';
import { stat } from 'fs';


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Ingresa un mensaje a encriptar: ', (message) => {
    console.log(`El mensaje ingresado es: ${message}`);

    //Clave 
    const aesKey:string = '1lofhty49ol3jsu2'
    if(aesKey.length < 16){
        console.log('La clave debe tener 16 caracteres');
        rl.close();
    };

    const messageState=createState(message, true);
    const keyState=createState(aesKey, true);
    console.log(messageState);
    console.log(`El mensaje ingresado se dividio en ${messageState.length}`)
    messageState.forEach((state, index)=>{
        console.log(`Bloque ${index+1}`, state)
    });
    rl.close();
});



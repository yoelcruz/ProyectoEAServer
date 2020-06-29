import express from 'express';
import { Server } from 'http';
import mongoose from 'mongoose';

import cors from 'cors';

import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';

import userRoutes from "./routes/usuario";
import postRoutes from './routes/post';
import socketIO  from 'socket.io';
import { UserManager } from './chat/user-manager';
import { MessageManager } from './chat/message-manager';

const app = express();
const server = new Server(app);


// IO = esta es la comunicacion del backend
/* io.origins(['http://192.168.1.17:8100']);
import './chat/sockets/socket'; */

app.use( cors());
// Body parser
app.use( bodyParser.urlencoded({ extended: true }) );
app.use( bodyParser.json() );

// FileUpload
app.use( fileUpload() );

// Configurar CORS
app.use( fileUpload({ useTempFiles: true }) );

// Rutas de mi app
app.use('/user', userRoutes );
app.use('/posts', postRoutes );


// Conectar DB
mongoose.connect('mongodb://localhost:27017/proyectoIonic', 
                {  useNewUrlParser: true, useCreateIndex: true }, ( err ) => {

    if ( err ) throw err;

    console.log('Base de datos ONLINE');
});

export const io = socketIO.listen(server);

type SalaUsuario = {
    nombre: string;
    sala: string;
}

type ChatMessage = {
    nombre: string;
    mensaje: string;
    sala: string;
}

io.on('connection', (client) => {
    console.log('connection');

    client.on('entrarChat', (data: SalaUsuario) => {

        client.join(data.sala, () => {
            console.log('data.sala:', data.sala);

            UserManager.agregarPersona(client.id, data.nombre, data.sala);
            
            //client.broadcast.to(data.sala).emit('listaPersona', UserManager.getPersonasPorSala(data.sala));
                // sending to all clients in 'game' room, including sender
            io.in(data.sala).emit('listaPersona', UserManager.getPersonasPorSala(data.sala));
            
            client.broadcast.to(data.sala).emit('crearMensaje', MessageManager.crearMensaje('Administrador', `${ data.nombre } se unió`));
                       
        });
        
    });

    client.on('salirChat', (data: SalaUsuario) => { 
        let personaBorrada = UserManager.borrarPersona(client.id);

        client.broadcast.to(personaBorrada.sala).emit('crearMensaje', MessageManager.crearMensaje('Administrador', `${ personaBorrada.nombre } salió`));
        client.broadcast.to(personaBorrada.sala).emit('listaPersona', UserManager.getPersonasPorSala(personaBorrada.sala)); 
        client.leave(personaBorrada.sala);
    });

    client.on('crearMensaje', (data: ChatMessage) => {

        console.log("Nombre y mensaje de usuario a todos los usuarios del chat", data);

        let persona = UserManager.getPersona(client.id);

        let mensaje = MessageManager.crearMensaje(persona.nombre, data.mensaje);
        client.broadcast.to(persona.sala).emit('crearMensaje', mensaje);

    });

    client.on('disconnect', () => {

        //let personaBorrada = UserManager.borrarPersona(client.id);
        console.log('clientIddddd', client.id);
        /* client.broadcast.to(personaBorrada.sala).emit('crearMensaje', MessageManager.crearMensaje('Administrador', `${ personaBorrada.nombre } salió`));
        client.broadcast.to(personaBorrada.sala).emit('listaPersona', UserManager.getPersonasPorSala(personaBorrada.sala)); */

    });
});


// Levantar express
server.listen( 3000, () => {
    console.log(`Servidor corriendo en el puerto 3000`);
});


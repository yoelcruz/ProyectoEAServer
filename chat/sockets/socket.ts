/* import { io } from '../../index';
import { UserManager } from '../user-manager';
import { MessageManager } from '../message-manager';

type ChatRoom = { 
    nombre: string;
    sala: string;
}

type ChatMessage = {
    mensaje: string;
}

io.on('connection', (client) => {

    client.on('entrarChat', (data: ChatRoom, callback) => {
    

        if (!data.nombre || !data.sala) {
            return callback({
                error: true,
                mensaje: 'El nombre/sala es necesario'
            });
        }

        client.join(data.sala);

        UserManager.agregarPersona(client.id, data.nombre, data.sala);

        client.broadcast.to(data.sala).emit('listaPersona', UserManager.getPersonasPorSala(data.sala));
        client.broadcast.to(data.sala).emit('crearMensaje', MessageManager.crearMensaje('Administrador', `${ data.nombre } se unió`));
        callback(UserManager.getPersonasPorSala(data.sala));
    });

    client.on('crearMensaje', (data: ChatMessage, callback) => {

        let persona = UserManager.getPersona(client.id);

        let mensaje = MessageManager.crearMensaje(persona.nombre, data.mensaje);
        client.broadcast.to(persona.sala).emit('crearMensaje', mensaje);

        callback(mensaje);
    });


    client.on('disconnect', () => {

        let personaBorrada = UserManager.borrarPersona(client.id);

        client.broadcast.to(personaBorrada.sala).emit('crearMensaje', MessageManager.crearMensaje('Administrador', `${ personaBorrada.nombre } salió`));
        client.broadcast.to(personaBorrada.sala).emit('listaPersona', UserManager.getPersonasPorSala(personaBorrada.sala));

    });

    // Mensajes privados
    client.on('mensajePrivado', data => {

        let persona = UserManager.getPersona(client.id);
        //para es el id del usuario al que quiero enviar el mensaje
        client.broadcast.to(data.para).emit('mensajePrivado', MessageManager.crearMensaje(persona.nombre, data.mensaje));
    });



}); */
import { Schema, Document, model } from 'mongoose';
import { Usuario } from './usuario.model';

const postSchema = new Schema({

    created: {
        type: Date
    },
    mensaje:{
        type: String
    },
    imgs: [{
        type: String
    }],
    coords: {
        type: String //longitud, latitud
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: [true, 'Debe de existir una referencia a un usuario']
    },
    usuarios: [{
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    }]
});

//Tiene que ser una funcion normal, (no puede ser una función de flecha)
postSchema.pre<IPost>('save', function( next ) {
    this.created = new Date();
    next();
});

interface IPost extends Document {
    created: Date;  //Podríamos utilizar para mejorar la fecha momentjs.com 
    mensaje: string;
    img: string[];
    coords: string;
    usuario: string;
    usuarios: string[];
}

export const Post = model<IPost>('Post', postSchema);
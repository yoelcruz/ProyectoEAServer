import { Router, Response } from 'express';
import { verificaToken } from '../middlewares/autenticacion';
import { Post } from '../models/post.model';
import { FileUpload } from '../interfaces/file-upload';
import FileSystem from '../classes/file-system';



const postRoutes = Router();
const fileSystem = new FileSystem();


// Obtener POST paginados
postRoutes.get('/', async (req: any, res: Response) => {

    let pagina = Number(req.query.pagina) || 1;
    let skip = pagina -1;
    skip = skip * 10;

    //se podría ordenar tmb utilizando la fecha
    const posts = await Post.find()
                            .sort({ _id: -1 }) 
                            .skip( skip ) 
                            .limit(10)  
                            .populate('usuario', '-password')
                            .exec();


    res.json({
        ok: true,
        pagina,
        posts
    });

});

// Añadir usuario al POST
postRoutes.post('/:postId/addUser', [ verificaToken ], async(req: any, res: Response) => {

    const postId: string= req.params.postId;
    const userId: string= req.usuario._id;
    

    Post.findById(postId).then( async postDB => {
        if(!postDB){
            return res.status(400).json({
                ok: false,
                mensaje: 'No se ha encontrado ningún post'
            });
        }

        if(!postDB.usuarios.includes(userId)){
            postDB.usuarios.push(userId);
            await postDB.save();
        }

        res.json({
            ok: true,
            post: postDB
        });            
    });
});

// Eliminar usuario al POST
postRoutes.post('/:postId/deleteUser', [ verificaToken ], async(req: any, res: Response) => {

    const postId: string= req.params.postId;
    const userId: string= req.usuario._id;
    

    Post.findById(postId).then( async postDB => {
        if(!postDB){
            return res.status(400).json({
                ok: false,
                mensaje: 'No se ha encontrado ningún post'
            });
        }

        if( postDB.usuarios.includes(userId)){
            const index = postDB.usuarios.indexOf(userId)
            postDB.usuarios.splice(index,1);
            await postDB.save();
        }

        res.json({
            ok: true,
            post: postDB
        });            
    });
});

//Obtener post by id
postRoutes.get('/postById/:postId', (req: any, res: Response) => {
    const postId: string= req.params.postId;

    Post.findById(postId).then( async postDB => {
        if(!postDB){
            return res.status(400).json({
                ok: false,
                mensaje: 'No se ha encontrado ningún post'
            });
        }
        await postDB.populate('usuarios').execPopulate();

        res.json({
            ok: true,
            post: postDB
        });            
    });

});

// Crear POST
postRoutes.post('/', [ verificaToken ], (req: any, res: Response) => {

    const body = req.body;
    body.usuario = req.usuario._id;

    const imagenes = fileSystem.imagenesDeTempHaciaPost( req.usuario._id);
    body.imgs = imagenes;


    Post.create( body ).then( async postDB => {

        await postDB.populate('usuario', '-password').execPopulate();

        res.json({
            ok: true,
            post: postDB
        });
    }).catch( err => {
        res.json(err)
    });

});


// Servicio para subir archivos
postRoutes.post( '/upload', [ verificaToken ], async(req: any, res: Response) => {

    if ( !req.files ) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No se ha subido ningún archivo'
        });
    }

    const file: FileUpload = req.files.image;

    if ( !file ) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No se ha subido ningún archivo - image'
        });
    }

    if ( !file.mimetype.includes('image') ) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Lo que has subido no es una imagen, y sólo se pueden subir imágenes'
        });
    }

    await fileSystem.guardarImagenTemporal ( file, req.usuario._id );

    res.json({
        ok: true,
        file: file.mimetype
    });
});

postRoutes.get('/imagen/:userid/:img', (req: any, res: Response) => {

    const userId = req.params.userid;
    const img    = req.params.img;

    const pathFoto = fileSystem.getFotoUrl( userId, img );

    res.sendFile( pathFoto );
    
});


export default postRoutes;
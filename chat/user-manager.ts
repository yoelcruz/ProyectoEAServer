// Modelo con el que trabajaremos
/* {
        id: 'ASLKFAJSLDFKASJDFASF-asd',
        nombre: 'Yoel'
    } */


type Persona = {
    id: string;
    nombre: string;
    sala: string;
}

class Usuarios {

    private personas: Persona[];

    constructor() {
        this.personas = [];
    }

    agregarPersona(id: string, nombre: string, sala: string) {

        let persona = { id, nombre, sala };

        this.personas.push(persona);

        return this.personas;
    }

    getPersona(id: string) {
        let persona = this.personas.filter(persona => persona.id === id)[0];

        return persona;
    }

    getPersonas() {
        return this.personas;
    }

    getPersonasPorSala(sala: string) {
        let personasEnSala = this.personas.filter(persona => persona.sala === sala);
        console.log('personas en sala', personasEnSala);
        return personasEnSala;
    }

    borrarPersona(id: string) {

        let personaBorrada = this.getPersona(id);

        this.personas = this.personas.filter(persona => persona.id != id);

        return personaBorrada;

    }

}


export const UserManager = new Usuarios();

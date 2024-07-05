class Persona{
    id;
    nombre;
    apellido;
    fechaNacimiento;

    constructor(i, n, a, fN){
        this.id = parseInt(i);
        this.nombre = n.trim();
        this.apellido = a.trim();
        this.fechaNacimiento = parseInt(fN);
    }
}

class Ciudadano extends Persona{
    dni;

    constructor(i, n, a, fN, d){
        super(i, n, a, fN);
        this.dni = parseInt(d);
        
    }

    CiudadanoExiste(arrayPersona) {
        let ret = false
        arrayPersona.forEach(persona => {
            if (this.nombre.toLowerCase() == persona.nombre.toLowerCase() && this.apellido.toLowerCase() == persona.apellido.toLowerCase() && this.fechaNacimiento == persona.fechaNacimiento && 
                this.dni == persona.dni) {
                ret = true;
            }
        });

        return ret;
    }
}

class Extranjero extends Persona{
    paisOrigen;

    constructor(i, n, a, fN, pO){
        super(i, n, a, fN);
        this.paisOrigen = pO.trim();
        
    }

    ExtranjeroExiste(arrayPersona) {
        let ret = false
        arrayPersona.forEach(persona => {
            if (this.nombre.toLowerCase() == persona.nombre.toLowerCase() && this.apellido.toLowerCase() == persona.apellido.toLowerCase() && this.fechaNacimiento == persona.fechaNacimiento && 
                this.dni == persona.dni) {
                ret = true;
            }
        });

        return ret;
    }
}

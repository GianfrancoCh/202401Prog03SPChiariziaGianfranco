class Vehiculo{
    id;
    modelo;
    anoFab;
    velMax;

    constructor(i, m, aF, vM){
        this.id = parseInt(i);
        this.modelo = m.trim();
        this.anoFab = parseInt(aF);
        this.velMax = parseInt(vM);
    }
}

class Aereo extends Vehiculo{
    altMax;
    autonomia;

    constructor(i, m, aF, vM, aM, au){
        super(i, m, aF, vM);
        this.altMax = parseInt(aM);
        this.autonomia = parseInt(au);
    }

    AereoExiste(arrayVehiculos) {
        let ret = false
        arrayVehiculos.forEach(vehiculo => {
            if (this.modelo.toLowerCase() == vehiculo.modelo.toLowerCase() && this.anoFab == vehiculo.anoFab && this.velMax == vehiculo.velMax &&
                this.altMax == vehiculo.altMax && this.autonomia == vehiculo.autonomia) {
                ret = true;
            }
        });

        return ret;
    }
}

class Terrestre extends Vehiculo{
    cantPue;
    cantRue;

    constructor(i, m, aF, vM, cP, cR){
        super(i, m, aF, vM);
        this.cantPue = parseInt(cP);
        this.cantRue = parseInt(cR);
    }

    TerrestreExiste(arrayVehiculos) {
        let ret = false
        arrayVehiculos.forEach(vehiculo => {
            if (this.modelo.toLowerCase() == vehiculo.modelo.toLowerCase() && this.anoFab == vehiculo.anoFab && this.velMax == vehiculo.velMax &&
                this.cantPue == vehiculo.cantPue && this.cantRue == vehiculo.cantRue) {
                ret = true;
            }
        });

        return ret;
    }
}

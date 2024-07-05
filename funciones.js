const formPpal = document.getElementById('formPpal');
const divSpinner = document.getElementById('spinner_container');
//#region Constantes Tabla
/* Columnas */
const cuerpoTabla = document.getElementById('fuenteCuerpo');
const cabeceraTabla = document.getElementById('fila0');
const col_id = document.querySelector('.col_id');
const col_modelo = document.querySelector('.col_modelo');
const col_anoFab = document.querySelector('.col_anoFab');
const col_velMax = document.querySelector('.col_velMax');
const col_altMax = document.querySelector('.col_altMax');
const col_autonomia = document.querySelector('.col_autonomia');
const col_cantPue = document.querySelector('.col_cantPue');
const col_cantRue = document.querySelector('.col_cantRue');
//#endregion

//#region Constantes Formulario ABM
const formABM = document.getElementById('formABM');
const formTitulo = document.getElementById('formTitulo');
const btnAgregar = document.getElementById('agregar');
const abmSel_tipo = document.getElementById('abmSel_tipo');
/*Inputs tipo*/
const abm_tipo = document.getElementById('div_tipo');
const inpId = document.querySelector('.formInputs #inp_id');
const inpModelo = document.querySelector('.formInputs #inp_modelo');
const inpAnoFab = document.querySelector('.formInputs #inp_anoFab');
const inpVelMax = document.querySelector('.formInputs #inp_velMax');
const inpAltMax = document.querySelector('.formInputs #inp_altMax');
const inpAutonomia = document.querySelector('.formInputs #inp_autonomia');
const inpCantPue = document.querySelector('.formInputs #inp_cantPue');
const inpCantRue = document.querySelector('.formInputs #inp_cantRue');
const inpAereo = document.querySelector('.formInputs .inputAereo');
const inpTerrestre = document.querySelector('.formInputs .inputTerrestre');
/*Botones*/
const abmAceptar = document.getElementById('aceptar');
const abmCancelar = document.getElementById('cancelar');

let abmId;
let abmModelo;
let abmAnoFab;
let abmVelMax;
let abmAltMax;
let abmAutonomia;
let abmCantPue;
let abmCantRue;
//#endregion

//Carga de datos a la tabla
var arrayVehiculos = [];


//#region AJAX
function LeerJson() {
	EstadoSpinner(true);
	let consulta = fetch("http://localhost/VehiculosAereoTerrestre.php", {
		method: "GET",
		mode: "cors",
		cache: "no-cache",
		credentials: "same-origin",
		headers: {
			'Content-Type': 'application/json'
		},
		redirect: "follow",
		referrerPolicy: "no-referrer",
	});
	consulta.then(respuesta => {
		EstadoSpinner(false);
		if (respuesta.status == 200) {
			respuesta.json().then(objJson => {
				ObjetosAVehiculos(objJson);
				CargarTabla(arrayVehiculos);
			})
		} else {
			alert("No se pudieron recuperar los datos.")
		}
	});
}

function ObjetosAVehiculos(array) {
	let auxArray = array;
	arrayVehiculos = [];
	auxArray.forEach((vehiculo) => {
		if (vehiculo.hasOwnProperty("id") && vehiculo.hasOwnProperty("modelo")
			&& vehiculo.hasOwnProperty("anoFab") && vehiculo.hasOwnProperty("velMax")) {
			if (vehiculo.hasOwnProperty("altMax")) {
				let aereo = new Aereo(vehiculo.id, vehiculo.modelo, vehiculo.anoFab, vehiculo.velMax, vehiculo.altMax, vehiculo.autonomia);
				arrayVehiculos.push(aereo);
			} else if (vehiculo.hasOwnProperty("cantPue")) {
				let terrestre = new Terrestre(vehiculo.id, vehiculo.modelo, vehiculo.anoFab, vehiculo.velMax, vehiculo.cantPue, vehiculo.cantRue);
				arrayVehiculos.push(terrestre);
			}
		}
	});
}

function AgregarVehiculo(vehiculo) {
	if (DatosValidosVehiculo(vehiculo)) {
		EstadoSpinner(true);
		let xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = () => {
			if (xhttp.readyState == 4) {
				EstadoSpinner(false);
				if (xhttp.status == 200) {
					let objJson = JSON.parse(xhttp.response);
					vehiculo.id = objJson.id;
					arrayVehiculos.push(vehiculo);
				} else {
					alert("Hubo un problema con el alta!")
				}
			}
			CerrarABM();
		};
		xhttp.open("PUT", "http://localhost/VehiculosAereoTerrestre.php", true, "usuario", "pass");
		xhttp.setRequestHeader('Content-type', 'application/json');
		xhttp.send(JSON.stringify(vehiculo));
	} else {
		alert("Revise los campos!");
	}
}

async function ModificarVehiculo(vehiculo) {
	let consulta = null;
	let aereo = vehiculo instanceof Aereo && InputsValidosAereo();
	let terrestre = vehiculo instanceof Terrestre && InputsValidosTerrestre();
	if (aereo || terrestre) {
		EstadoSpinner(true);
		consulta = await fetch('http://localhost/VehiculosAereoTerrestre.php', {
			method: "POST",
			mode: "cors",
			cache: "no-cache",
			credentials: "same-origin",
			headers: {
				'Content-Type': 'application/json'
			},
			redirect: "follow",
			referrerPolicy: "no-referrer",
			body: JSON.stringify(vehiculo)
		});

		EstadoSpinner(false);
		if (consulta.status == 200) {
			vehiculo.modelo = abmModelo;
			vehiculo.anoFab = parseInt(abmAnoFab);
			vehiculo.velMax = parseInt(abmVelMax);
			if (aereo) {
				vehiculo.altMax = parseInt(abmAltMax);
				vehiculo.autonomia = parseInt(abmAutonomia);
			} else {
				vehiculo.cantPue = parseInt(abmCantPue);
				vehiculo.cantRue = parseInt(abmCantRue);
			}
		} else {
			alert("Hubo un problema con la modificación!");
		}
		CerrarABM();
	} else {
		alert("Revise los campos!");
	}
}

async function EliminarVehiculo(vehiculo) {
	let consulta = null;
	if (vehiculo instanceof Aereo || vehiculo instanceof Terrestre) {
		EstadoSpinner(true);
		consulta = await fetch('http://localhost/VehiculosAereoTerrestre.php', {
			method: "DELETE",
			mode: "cors",
			cache: "no-cache",
			credentials: "same-origin",
			headers: {
				'Content-Type': 'application/json'
			},
			redirect: "follow",
			referrerPolicy: "no-referrer",
			body: JSON.stringify(vehiculo)
		});

		EstadoSpinner(false);
		if (consulta.status == 200) {
			let index = BuscarVehiculo(vehiculo.id);
			arrayVehiculos.splice(index, 1);
		} else {
			alert("Hubo un problema con la baja!");
		}
		CerrarABM();
	} else {
		alert("Revise los campos!");
	}
}
//#endregion

function CargarTabla(vehiculos) {
	cuerpoTabla.innerHTML = "";

	vehiculos.forEach(vehiculo => {
		let auxElementos = [vehiculo.id, vehiculo.modelo, vehiculo.anoFab, vehiculo.velMax, vehiculo.altMax, vehiculo.autonomia, vehiculo.cantPue, vehiculo.cantRue];
		let nuevaFila = document.createElement("tr");
		nuevaFila.id = vehiculo.id;

		let celda;
		auxElementos.forEach(element => {
			let auxElement = element != null ? element.toString() : "N/A";
			celda = document.createElement("td");
			celda.className = nuevaFila.id;
			celda.id = `vehi${auxElementos[0]}Val${auxElement}`;
			celda.textContent = auxElement;
			nuevaFila.appendChild(celda);
		});

		let botones = ["Modificar", "Eliminar"];
		botones.forEach(btnStr => {
			let input = document.createElement("input");
			input.type = "button";
			input.id = btnStr + 'Vehi' + vehiculo.id;
			input.value = btnStr;
			input.addEventListener('click', AbmModifElim);

			celda = document.createElement("td");
			celda.appendChild(input);
			nuevaFila.appendChild(celda);
		});

		cuerpoTabla.appendChild(nuevaFila);
	});
}

function EstadoSpinner(estado) {
	estado ? divSpinner.style.setProperty("display", "flex") : divSpinner.style.removeProperty("display");
}

//#region Form ABM

btnAgregar.onclick = function () {
	AbrirABM();
	abm_tipo.style.display = 'inherit';
	abmAceptar.innerText = 'Aceptar';
	formTitulo.innerText = 'Alta';

	inpId.placeholder = 'ID único autogenerado';
	inpModelo.placeholder = 'Ingresar modelo de auto';
	inpAnoFab.placeholder = '1886+';
	inpVelMax.placeholder = '1+';
	inpAltMax.placeholder = '1+';
	inpAutonomia.placeholder = "1+";
	inpCantPue.placeholder = '1+';
	inpCantRue.placeholder = '1+';
}

function AbmModifElim(event) {
	let idFila = event.target.parentNode.parentNode.id;
	let indexVehiculo = BuscarVehiculo(idFila);
	let vehiculoSeleccionado = indexVehiculo != -1 ? arrayVehiculos[indexVehiculo] : null;

	if (vehiculoSeleccionado) {
		AbrirABM();

		abm_tipo.style.display = 'none';
		abmAceptar.innerText = event.target.value;
		formTitulo.innerText = event.target.value == 'Modificar' ? 'Modificación' : 'Baja';

		inpId.value = vehiculoSeleccionado.id;
		inpModelo.value = vehiculoSeleccionado.modelo;
		inpAnoFab.value = vehiculoSeleccionado.anoFab;
		inpVelMax.value = vehiculoSeleccionado.velMax;

		if (vehiculoSeleccionado instanceof Aereo) {
			inpAereo.style.display = 'inherit';
			inpTerrestre.style.display = 'none';
			inpAltMax.value = vehiculoSeleccionado.altMax;
			inpAutonomia.value = vehiculoSeleccionado.autonomia;
		} else {
			inpAereo.style.display = 'none';
			inpTerrestre.style.display = 'inherit';
			inpCantPue.value = vehiculoSeleccionado.cantPue;
			inpCantRue.value = vehiculoSeleccionado.cantRue;
		}
	} else {
		alert("Hubo un problema!");
	}

	abmAceptar.innerText == 'Eliminar' ? BloquearInputs(true) : BloquearInputs(false);

}

function BloquearInputs(estado) {
	let inputs = [inpModelo, inpAnoFab, inpVelMax, inpAltMax, inpAutonomia, inpCantPue, inpCantRue];
	inputs.forEach(element => {
		element.readOnly = estado;
		element.style.cursor = estado ? 'not-allowed' : 'auto';
	});
};

abmAceptar.onclick = function () {
	abmId = inpId.value;
	abmModelo = inpModelo.value;
	abmAnoFab = inpAnoFab.value;
	abmVelMax = inpVelMax.value;

	abmAltMax = inpAltMax.value;
	abmAutonomia = inpAutonomia.value;

	abmCantPue = inpCantPue.value;
	abmCantRue = inpCantRue.value;

	let auxVehiculos = arrayVehiculos;

	if (formTitulo.innerText == 'Alta') {
		if (abmSel_tipo.value === 'A') {
			let aereo = new Aereo(null, abmModelo, abmAnoFab, abmVelMax, abmAltMax, abmAutonomia);
			aereo.AereoExiste(auxVehiculos) ? alert("Este aéreo ya existe!") : AgregarVehiculo(aereo);
		} else if (abmSel_tipo.value === 'T') {
			let terrestre = new Terrestre(null, abmModelo, abmAnoFab, abmVelMax, abmCantPue, abmCantRue);
			terrestre.TerrestreExiste(auxVehiculos) ? alert("Este terrestre ya existe!") : AgregarVehiculo(terrestre);
		}
	} else {
		let index = BuscarVehiculo(abmId);
		formTitulo.innerText == 'Modificación' ? ModificarVehiculo(auxVehiculos[index]) : EliminarVehiculo(auxVehiculos[index]);
	}

}

abmCancelar.onclick = CerrarABM;

abmSel_tipo.addEventListener('change', () => {
	if (abmSel_tipo.value === 'A') {
		inpTerrestre.style.display = 'none';
		inpAereo.style.display = 'inherit';
	} else {
		inpAereo.style.display = 'none';
		inpTerrestre.style.display = 'inherit';
	}
});

function BuscarVehiculo(id) {
	let index = -1;
	for (let i = 0; i < arrayVehiculos.length; i++) {
		let vehiculo = arrayVehiculos[i];
		if (vehiculo.id == id) {
			index = i;
			break;
		}
	}

	return index;
}

function InputsValidosAereo() {
	let modelo = inpModelo.value;
	let anoFab = inpAnoFab.value;
	let velMax = inpVelMax.value;

	let altMax = inpAltMax.value;
	let autonomia = inpAutonomia.value;

	return modelo.trim() && parseInt(anoFab) > 1885 && parseInt(anoFab) <= 2022 && parseInt(velMax) > 0
		&& parseInt(altMax) > 0 && parseInt(autonomia) > 0;
}

function InputsValidosTerrestre() {
	let modelo = inpModelo.value;
	let anoFab = inpAnoFab.value;
	let velMax = inpVelMax.value;

	let cantPue = inpCantPue.value;
	let cantRue = inpCantRue.value;

	return modelo.trim() && parseInt(anoFab) > 1885 && parseInt(anoFab) <= 2022 && parseInt(velMax) > 0
		&& parseInt(cantPue) > 0 && parseInt(cantRue) > 0;
}

function DatosValidosVehiculo(vehiculo) {
	return ((vehiculo.modelo).trim() && parseInt(vehiculo.anoFab) > 1885 && parseInt(vehiculo.anoFab) <= 2022 && parseInt(vehiculo.velMax) > 0)
		&& vehiculo instanceof Aereo ? (parseInt(vehiculo.altMax) > 0 && parseInt(vehiculo.autonomia) > 0)
		: (parseInt(vehiculo.cantPue) > 0 && parseInt(vehiculo.cantRue) > 0);
}

function AbrirABM() {
	formPpal.style.display = 'none';
	formABM.style.display = 'flex';
	BloquearInputs(false);
}

function CerrarABM() {
	formABM.style.display = 'none';
	formPpal.style.display = 'flex';

	inpId.value = '';
	inpModelo.value = '';
	inpAnoFab.value = '';
	inpVelMax.value = '';
	inpAltMax.value = '';
	inpAutonomia.value = '';
	inpCantPue.value = '';
	inpCantRue.value = '';

	let evt = document.createEvent("HTMLEvents");
	evt.initEvent("change", false, true);
	abmSel_tipo.dispatchEvent(evt);
	/* Disparo el evento del selector de tipos en el ABM
	para que se muestren los campos indicados */

	setTimeout(() => {
		CargarTabla(arrayVehiculos);
	}, 10);
}
//#endregion

//#region Ordenamiento columnas
col_id.addEventListener('click', () => {
	arrayVehiculos.sort((p1, p2) => CompararValores(p1.id, p2.id));
	CargarTabla(arrayVehiculos);
});
col_modelo.addEventListener('click', () => {
	arrayVehiculos.sort((p1, p2) => CompararValores(p1.modelo, p2.modelo));
	CargarTabla(arrayVehiculos);
});
col_anoFab.addEventListener('click', () => {
	arrayVehiculos.sort((p1, p2) => CompararValores(p1.anoFab, p2.anoFab));
	CargarTabla(arrayVehiculos);
});
col_velMax.addEventListener('click', () => {
	arrayVehiculos.sort((p1, p2) => CompararValores(p1.velMax, p2.velMax));
	CargarTabla(arrayVehiculos);
});
col_altMax.addEventListener('click', () => {
	arrayVehiculos.sort((p1, p2) => CompararValores(p1.altMax, p2.altMax));
	CargarTabla(arrayVehiculos);
});
col_autonomia.addEventListener('click', () => {
	arrayVehiculos.sort((p1, p2) => CompararValores(p1.autonomia, p2.autonomia));
	CargarTabla(arrayVehiculos);
});
col_cantPue.addEventListener('click', () => {
	arrayVehiculos.sort((p1, p2) => CompararValores(p1.cantPue, p2.cantPue));
	CargarTabla(arrayVehiculos);
});
col_cantRue.addEventListener('click', () => {
	arrayVehiculos.sort((p1, p2) => CompararValores(p1.cantRue, p2.cantRue));
	CargarTabla(arrayVehiculos);
});


function CompararValores(valorA, valorB) {
	if (valorA != null) {
		if (valorA > valorB) {
			return 1;
		} else if (valorA == valorB) {
			return 0;
		} else {
			return -1;
		}
	}
}
//#endregion

LeerJson();

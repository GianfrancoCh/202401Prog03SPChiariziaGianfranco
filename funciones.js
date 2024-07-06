const formPpal = document.getElementById('formPpal');
const divSpinner = document.getElementById('spinner_container');
//#region Constantes Tabla
/* Columnas */
const cuerpoTabla = document.getElementById('fuenteCuerpo');
const cabeceraTabla = document.getElementById('fila0');
const col_id = document.querySelector('.col_id');
const col_nombre = document.querySelector('.col_nombre');
const col_apellido = document.querySelector('.col_apellido');
const col_fechaNacimiento = document.querySelector('.col_fechaNacimiento');
const col_dni = document.querySelector('.col_dni');
const col_paisOrigen = document.querySelector('.col_paisOrigen');
//#endregion

//#region Constantes Formulario ABM
const formABM = document.getElementById('formABM');
const formTitulo = document.getElementById('formTitulo');
const btnAgregar = document.getElementById('agregar');
const abmSel_tipo = document.getElementById('abmSel_tipo');
/*Inputs tipo*/
const abm_tipo = document.getElementById('div_tipo');
const inpId = document.querySelector('.formInputs #inp_id');
const inpNombre = document.querySelector('.formInputs #inp_nombre');
const inpApellido = document.querySelector('.formInputs #inp_apellido');
const inpFechaNacimiento = document.querySelector('.formInputs #inp_fechaNacimiento');
const inpDni = document.querySelector('.formInputs #inp_dni');
const inpPaisOrigen = document.querySelector('.formInputs #inp_paisOrigen');
const inpCiudadano = document.querySelector('.formInputs .inputCiudadano');
const inpExtranjero = document.querySelector('.formInputs .inputExtranjero');
/*Botones*/
const abmAceptar = document.getElementById('aceptar');
const abmCancelar = document.getElementById('cancelar');

let abmId;
let abmNombre;
let abmApellido;
let abmFechaNacimiento;
let abmDni;
let abmPaisOrigen;

//#endregion

//Carga de datos a la tabla
var arrayPersonas = [];


//#region AJAX

function LeerJson() {
	EstadoSpinner(true);
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = () => {
		if (xhttp.readyState == 4) {
			EstadoSpinner(false);
			if (xhttp.status == 200) {
				try {
					let objJson = JSON.parse(xhttp.responseText);
					ObjetosAPersonas(objJson);
					CargarTabla(arrayPersonas);
				} catch (error) {
					console.error('Error parsing JSON:', error);
					alert("Error al procesar los datos.");
				}
			} else {
				alert("No se pudieron recuperar los datos.");
			}
		}
	};
	xhttp.open("GET", "https://examenesutn.vercel.app/api/PersonaCiudadanoExtranjero", true);
	xhttp.setRequestHeader('Content-Type', 'application/json');
	xhttp.send();
}
function ObjetosAPersonas(array) {
	let auxArray = array;
	arrayPersonas = [];
	auxArray.forEach((persona) => {
		if (persona.hasOwnProperty("id") && persona.hasOwnProperty("nombre")
			&& persona.hasOwnProperty("apellido") && persona.hasOwnProperty("fechaNacimiento")) {
			if (persona.hasOwnProperty("dni")) {
				let ciudadano = new Ciudadano(persona.id, persona.nombre, persona.apellido,persona.fechaNacimiento,persona.dni);
				arrayPersonas.push(ciudadano);
			} else if (persona.hasOwnProperty("paisOrigen")) {
				let extranjero = new Extranjero(persona.id, persona.nombre, persona.apellido,persona.fechaNacimiento, persona.paisOrigen);
				arrayPersonas.push(extranjero);
			}
		}
	});
}

async function AgregarPersona(persona) {
	if (DatosValidosPersona(persona)) {
		EstadoSpinner(true);
		try {
			let respuesta = await fetch('https://examenesutn.vercel.app/api/PersonaCiudadanoExtranjero', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(persona)
			});
			EstadoSpinner(false);
			if (respuesta.status === 200) {
				let objJson = await respuesta.json();
				persona.id = objJson.id;
				arrayPersonas.push(persona);
			} else {
				alert("Hubo un problema con el alta!");
			}
		} catch (error) {
			console.error('Error:', error);
			alert("Hubo un problema con el alta!");
		} finally {
			CerrarABM();
		}
	} else {
		alert("Revise los campos!");
	}
}

async function ModificarPersona(persona) {
	let consulta = null;
	let ciudadano = persona instanceof Ciudadano && InputsValidosCiudadano();
	let extranjero = persona instanceof Extranjero && InputsValidosExtranjero();
	if (ciudadano || extranjero) {
		EstadoSpinner(true);
		try {
			consulta = await fetch('https://examenesutn.vercel.app/api/PersonaCiudadanoExtranjero', {
				method: 'PUT',
				mode: 'cors',
				cache: 'no-cache',
				credentials: 'same-origin',
				headers: {
					'Content-Type': 'application/json'
				},
				redirect: 'follow',
				referrerPolicy: 'no-referrer',
				body: JSON.stringify(persona)
			});
			EstadoSpinner(false);
			if (consulta.status === 200) {
				persona.nombre = abmNombre;
				persona.apellido = abmApellido;
				persona.fechaNacimiento = abmFechaNacimiento;
				if (ciudadano) {
					persona.dni = parseInt(abmDni);
				} else {
					persona.paisOrigen = abmPaisOrigen;
				}
			} else {
				alert("Hubo un problema con la modificación!");
			}
		} catch (error) {
			console.error('Error:', error);
			alert("Hubo un problema con la modificación!");
		} finally {
			CerrarABM();
		}
	} else {
		alert("Revise los campos!");
	}
}


async function EliminarPersona(persona) {
	let consulta = null;
	if (persona instanceof Ciudadano || persona instanceof Extranjero) {
		EstadoSpinner(true);
		consulta = await fetch('https://examenesutn.vercel.app/api/PersonaCiudadanoExtranjero', {
			method: "DELETE",
			mode: "cors",
			cache: "no-cache",
			credentials: "same-origin",
			headers: {
				'Content-Type': 'application/json'
			},
			redirect: "follow",
			referrerPolicy: "no-referrer",
			body: JSON.stringify(persona)
		});

		EstadoSpinner(false);
		if (consulta.status == 200) {
			let index = BuscarPersona(persona.id);
			arrayPersonas.splice(index, 1);
		} else {
			alert("Hubo un problema con la baja!");
		}
		CerrarABM();
	} else {
		alert("Revise los campos!");
	}
}
//#endregion

function CargarTabla(personas) {
	cuerpoTabla.innerHTML = "";

	personas.forEach(persona => {
		let auxElementos = [persona.id, persona.nombre, persona.apellido, persona.fechaNacimiento, persona.dni, persona.paisOrigen];
		let nuevaFila = document.createElement("tr");
		nuevaFila.id = persona.id;

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
			input.id = btnStr + 'Vehi' + persona.id;
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

	inpId.placeholder = 'ID autogenerado';
	inpNombre.placeholder = 'Ingresar nombre';
	inpApellido.placeholder = 'Ingresar apellido';
	inpFechaNacimiento.placeholder = '>1900';
	inpDni.placeholder = '+1';
	inpPaisOrigen.placeholder = "Ingrese pais origen";
	inpExtranjero.style.display = 'none';

}

function AbmModifElim(event) {
	let idFila = event.target.parentNode.parentNode.id;
	let indexPersona = BuscarPersona(idFila);
	let personaSeleccionada = indexPersona != -1 ? arrayPersonas[indexPersona] : null;

	if (personaSeleccionada) {
		AbrirABM();

		abm_tipo.style.display = 'none';
		abmAceptar.innerText = event.target.value;
		formTitulo.innerText = event.target.value == 'Modificar' ? 'Modificación' : 'Baja';

		inpId.value = personaSeleccionada.id;
		inpNombre.value = personaSeleccionada.nombre;
		inpApellido.value = personaSeleccionada.apellido;
		inpFechaNacimiento.value = personaSeleccionada.fechaNacimiento;

		if (personaSeleccionada instanceof Ciudadano) {
			inpCiudadano.style.display = 'inherit';
			inpExtranjero.style.display = 'none';
			inpDni.value = personaSeleccionada.dni;

		} else {
			inpCiudadano.style.display = 'none';
			inpExtranjero.style.display = 'inherit';
			inpPaisOrigen.value = personaSeleccionada.paisOrigen;
			
		}
	} else {
		alert("Hubo un problema!");
	}

	abmAceptar.innerText == 'Eliminar' ? BloquearInputs(true) : BloquearInputs(false);

}

function BloquearInputs(estado) {
	let inputs = [inpNombre, inpApellido, inpFechaNacimiento, inpDni, inpFechaNacimiento];
	inputs.forEach(element => {
		element.readOnly = estado;
		element.style.cursor = estado ? 'not-allowed' : 'auto';
	});
};

abmAceptar.onclick = function () {
	abmId = inpId.value;
	abmNombre = inpNombre.value;
	abmApellido = inpApellido.value;
	abmFechaNacimiento = inpFechaNacimiento.value;

	abmDni = inpDni.value;
	abmPaisOrigen = inpPaisOrigen.value;

	let auxPersonas = arrayPersonas;

	if (formTitulo.innerText == 'Alta') {
		if (abmSel_tipo.value === 'C') {
			let ciudadano = new Ciudadano(null, abmNombre, abmApellido, abmFechaNacimiento, abmDni);
			ciudadano.CiudadanoExiste(auxPersonas) ? alert("Este ciudadano ya existe!") : AgregarPersona(ciudadano);
		} else if (abmSel_tipo.value === 'E') {
			let extranjero = new Extranjero(null, abmNombre, abmApellido, abmFechaNacimiento, abmPaisOrigen);
			extranjero.ExtranjeroExiste(auxPersonas) ? alert("Este extranjero ya existe!") : AgregarPersona(extranjero);
		}
	} else {
		let index = BuscarPersona(abmId);
		formTitulo.innerText == 'Modificación' ? ModificarPersona(auxPersonas[index]) : EliminarPersona(auxPersonas[index]);
	}

}

abmCancelar.onclick = CerrarABM;

abmSel_tipo.addEventListener('change', () => {
	if (abmSel_tipo.value === 'C') {
		inpExtranjero.style.display = 'none';
		inpCiudadano.style.display = 'inherit';
	} else {
		inpCiudadano.style.display = 'none';
		inpExtranjero.style.display = 'inherit';
	}
});

function BuscarPersona(id) {
	let index = -1;
	for (let i = 0; i < arrayPersonas.length; i++) {
		let persona = arrayPersonas[i];
		if (persona.id == id) {
			index = i;
			break;
		}
	}

	return index;
}

function InputsValidosCiudadano() {
	let nombre = inpNombre.value;
	let apellido = inpApellido.value;
	let fechaNacimiento = inpFechaNacimiento.value;

	let dni = inpDni.value;
	return nombre.trim() && apellido.trim() && parseInt(fechaNacimiento) > 1 && parseInt(dni) > 100000;
}

function InputsValidosExtranjero() {
	let nombre = inpNombre.value;
	let apellido = inpApellido.value;
	let fechaNacimiento = inpFechaNacimiento.value;

	let paisOrigen = inpPaisOrigen.value;
	return nombre.trim() && apellido.trim() && parseInt(fechaNacimiento) > 1 && paisOrigen.trim();
}

function DatosValidosPersona(persona) {
	return ((persona.nombre).trim() && (persona.apellido).trim() && parseInt(persona.fechaNacimiento) > 0)
		&& persona instanceof Ciudadano ? (parseInt(persona.dni) > 10000000)
		: ((persona.paisOrigen).trim());
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
	inpNombre.value = '';
	inpApellido.value = '';
	inpFechaNacimiento.value = '';
	inpDni.value = '';
	inpPaisOrigen.value = '';

	let evt = document.createEvent("HTMLEvents");
	evt.initEvent("change", false, true);
	abmSel_tipo.dispatchEvent(evt);
	/* Disparo el evento del selector de tipos en el ABM
	para que se muestren los campos indicados */

	setTimeout(() => {
		CargarTabla(arrayPersonas);
	}, 10);
}
//#endregion

//#region Ordenamiento columnas
col_id.addEventListener('click', () => {
	arrayPersonas.sort((p1, p2) => CompararValores(p1.id, p2.id));
	CargarTabla(arrayPersonas);
});
col_nombre.addEventListener('click', () => {
	arrayPersonas.sort((p1, p2) => CompararValores(p1.nombre, p2.nombre));
	CargarTabla(arrayPersonas);
});
col_apellido.addEventListener('click', () => {
	arrayPersonas.sort((p1, p2) => CompararValores(p1.apellido, p2.apellido));
	CargarTabla(arrayPersonas);
});
col_fechaNacimiento.addEventListener('click', () => {
	arrayPersonas.sort((p1, p2) => CompararValores(p1.fechaNacimiento, p2.fechaNacimiento));
	CargarTabla(arrayPersonas);
});
col_dni.addEventListener('click', () => {
	arrayPersonas.sort((p1, p2) => CompararValores(p1.dni, p2.dni));
	CargarTabla(arrayPersonas);
});
col_paisOrigen.addEventListener('click', () => {
	arrayPersonas.sort((p1, p2) => CompararValores(p1.paisOrigen, p2.paisOrigen));
	CargarTabla(arrayPersonas);
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

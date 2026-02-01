let salarioIngresado = document.getElementById("salarioIngresado");
let toastElement = document.getElementById("toast");
let isssLabel = document.getElementById("isss");
let afpLabel = document.getElementById("afp");
let isrLabel = document.getElementById("isr");
let botonCalcular = document.getElementById("calcular");
let salarioNetoLabel = document.getElementById("salarioNeto");
let botonLimpiar = document.getElementById("limpiar");
let nombreLabel = document.querySelector(".nombreUsuario");
let nombreTexto = document.getElementById("nombreUsuarioTexto");
let nombreModal = document.getElementById("nombreModal");
let nombreInput = document.getElementById("nombreInput");
let botonNoInteresa = document.getElementById("nombreNoInteresa");
let botonAceptar = document.getElementById("nombreAceptar");
let toastTimeout;

/*Validacion del maximo de caracteres para el nombre*/
nombreInput.setAttribute("maxlength", "30");
nombreInput.addEventListener("input", function() {
  const valor = nombreInput.value;
  const soloLetras = valor.replace(/[^a-zA-ZÀ-ÿÑñ\s]/g, "");
  nombreInput.value = soloLetras.slice(0, 30);
});

/*Expresión regular para validar hasta 9 dígitos enteros y 2 decimales*/ 
const patronValido = /^\d{0,9}(\.\d{0,2})?$/;

/*Función para mostrar el toast*/
function mostrarToast(mensaje) {
  toastElement.textContent = mensaje;
  toastElement.classList.add("mostrar");
  
  /*Limpiar el timeout anterior si existe*/
  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }
  
  /*El toast desaparece después de 4 segundos*/
  toastTimeout = setTimeout(() => {
    toastElement.classList.remove("mostrar");
    limpiarCaja();
  }, 4000);
}

/*Función para limpiar la caja de texto*/
function limpiarCaja() {
  salarioIngresado.value = "";
}

function mostrarNombre(nombre) {
  nombreTexto.textContent = nombre;
  nombreLabel.classList.remove("oculto");
}

function ocultarNombre() {
  nombreTexto.textContent = "";
  nombreLabel.classList.add("oculto");
}

function mostrarModal() {
  nombreModal.classList.add("mostrar");
  nombreModal.setAttribute("aria-hidden", "false");
  nombreInput.focus();
}

function ocultarModal() {
  nombreModal.classList.remove("mostrar");
  nombreModal.setAttribute("aria-hidden", "true");
}

async function obtenerEstadoNombre() {
  try {
    const respuesta = await fetch("nombre.php?action=get", { cache: "no-store" });
    if (!respuesta.ok) return { nombre: "", dismissed: false };
    return await respuesta.json();
  } catch (e) {
    return { nombre: "", dismissed: false };
  }
}

async function guardarNombre(nombre) {
  const respuesta = await fetch("nombre.php?action=set", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre })
  });
  if (!respuesta.ok) {
    throw new Error("No se pudo guardar el nombre");
  }
  return await respuesta.json();
}

async function descartarNombre() {
  await fetch("nombre.php?action=dismiss", { method: "POST" });
}

async function initNombreUsuario() {
  const estado = await obtenerEstadoNombre();

  if (estado.nombre) {
    mostrarNombre(estado.nombre);
    return;
  }

  ocultarNombre();

  if (estado.dismissed) {
    return;
  }

  setTimeout(() => {
    mostrarModal();
  }, 4000);
}

/*Event listener para validar entrada en tiempo real*/
salarioIngresado.addEventListener("input", function(e) {
  let valor = e.target.value;
  
  /*Validar que solo contenga números y decimales*/
  if (!patronValido.test(valor)) {
    mostrarToast("Usá hasta 9 dígitos enteros y 2 decimales (000000000.00)");
  }
});

/*Event listener para calcular descuentos al hacer clic*/
botonCalcular.addEventListener("click", function() {
  let valor = salarioIngresado.value.trim();

  if (valor === "" || !patronValido.test(valor)) {
    mostrarToast("¡Por favor ingresa un sueldo !");
    return;
  }

  let salario = parseFloat(valor);

  if (isNaN(salario)) {
    mostrarToast("Ingresa un sueldo válido");
    return;
  }

  /* Valores del ISSS y AFP */
  const TOPE_ISSS = 1000;
  let baseIsss = salario > TOPE_ISSS ? TOPE_ISSS : salario;
  let descuentoIsss = baseIsss * 0.03;
  let descuentoAfp = salario * 0.0725;

  isssLabel.textContent = `ISSS: $${descuentoIsss.toFixed(2)}`;
  afpLabel.textContent = `AFP: $${descuentoAfp.toFixed(2)}`;

  /*Renta imponible*/
  let rentaImponible = salario - descuentoIsss - descuentoAfp;

  /*Calcular ISR*/ 
  let isr = 0;

  if (rentaImponible <= 550) {
    isr = 0;
  } else if (rentaImponible <= 895.24) {
    let excedente = rentaImponible - 550.0;
    isr = 17.67 + excedente * 0.10;
  } else if (rentaImponible <= 2038.10) {
    let excedente = rentaImponible - 895.24;
    isr = 60.0 + excedente * 0.20;
  } else {
    let excedente = rentaImponible - 2038.10;
    isr = 288.57 + excedente * 0.30;
  }

  let salarioNeto = salario - descuentoIsss - descuentoAfp - isr;

  isrLabel.textContent = `ISR: $${isr.toFixed(2)}`;
  let salarioNetoLabel = document.getElementById("salarioNeto");
  salarioNetoLabel.textContent = `Sueldo Neto: $${salarioNeto.toFixed(2)}`;

  botonLimpiar.disabled = false; /* Boton limpiar desactivado por defecto */
});

/*Efecto ripple para botones*/
function aplicarRipple(boton) {
  boton.addEventListener("click", function(e) {
    const ripple = document.createElement("span");
    ripple.classList.add("ripple");

    const rect = boton.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

    const rippleExistente = boton.querySelector(".ripple");
    if (rippleExistente) {
      rippleExistente.remove();
    }

    boton.appendChild(ripple);

    ripple.addEventListener("animationend", () => {
      ripple.remove();
    });
  });
}

aplicarRipple(botonLimpiar);
aplicarRipple(botonCalcular);

/* Limpia los labels y el input "boton limpiar" */
botonLimpiar.addEventListener("click", function() {
  isssLabel.textContent = "ISSS: $";
  afpLabel.textContent = "AFP: $";
  isrLabel.textContent = "ISR: $";
  salarioNetoLabel.textContent = "Sueldo Neto: $";
  salarioIngresado.value = "";
  botonLimpiar.disabled = true;
});

botonNoInteresa.addEventListener("click", async function() {
  await descartarNombre();
  ocultarModal();
  ocultarNombre();
});

botonAceptar.addEventListener("click", async function() {
  const nombre = nombreInput.value.trim();
  if (nombre === "") {
    return;
  }
  try {
    const resultado = await guardarNombre(nombre);
    mostrarNombre(resultado.nombre || nombre);
    ocultarModal();
  } catch (e) {
    mostrarToast("No se pudo guardar el nombre");
  }
});

initNombreUsuario();


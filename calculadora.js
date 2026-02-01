let salarioIngresado = document.getElementById("salarioIngresado");
let toastElement = document.getElementById("toast");
let isssLabel = document.getElementById("isss");
let afpLabel = document.getElementById("afp");
let isrLabel = document.getElementById("isr");
let botonCalcular = document.getElementById("calcular");
let salarioNetoLabel = document.getElementById("salarioNeto");
let botonLimpiar = document.getElementById("limpiar");
let toastTimeout;

// Expresión regular para validar solo números enteros y fraccionarios
const patronValido = /^[0-9]*\.?[0-9]*$/;

// Función para mostrar el toast
function mostrarToast(mensaje) {
  toastElement.textContent = mensaje;
  toastElement.classList.add("mostrar");
  
  // Limpiar el timeout anterior si existe
  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }
  
  // El toast desaparece después de 4 segundos
  toastTimeout = setTimeout(() => {
    toastElement.classList.remove("mostrar");
    limpiarCaja();
  }, 4000);
}

// Función para limpiar la caja de texto
function limpiarCaja() {
  salarioIngresado.value = "";
}

// Event listener para validar entrada en tiempo real
salarioIngresado.addEventListener("input", function(e) {
  let valor = e.target.value;
  
  // Validar que solo contenga números y puntos
  if (!patronValido.test(valor)) {
    mostrarToast("Solo se permiten números enteros o fraccionarios");
  }
});

// Event listener para calcular descuentos al hacer clic
botonCalcular.addEventListener("click", function() {
  let valor = salarioIngresado.value.trim();

  if (valor === "" || !patronValido.test(valor)) {
    mostrarToast("¡Por favor ingresa un salario !");
    return;
  }

  let salario = parseFloat(valor);

  if (isNaN(salario)) {
    mostrarToast("Ingresa un salario válido");
    return;
  }

  /* Valores del ISSS y AFP */
  let descuentoIsss = salario * 0.03;
  let descuentoAfp = salario * 0.0725;

  isssLabel.textContent = `ISSS: $${descuentoIsss.toFixed(2)}`;
  afpLabel.textContent = `AFP: $${descuentoAfp.toFixed(2)}`;

  // Renta imponible
  let rentaImponible = salario - descuentoIsss - descuentoAfp;

  // Calcular ISR según tabla 2025
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

/* Limpia los labels y el input "boton limpiar" */
botonLimpiar.addEventListener("click", function() {
  isssLabel.textContent = "ISSS: $";
  afpLabel.textContent = "AFP: $";
  isrLabel.textContent = "ISR: $";
  salarioNetoLabel.textContent = "Sueldo Neto: $";
  salarioIngresado.value = "";
  botonLimpiar.disabled = true;
});


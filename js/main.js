// ===== 1. Datos =====
const TELEFONO = "528717830276"; // Número de WhatsApp: 52 + 10 dígitos

// precio: null  ->  muestra "Precio por cotización" y un botón para cotizar por WhatsApp
const productos = [
  { nombre: "Bouquet de 50 rosas en tonos pastel", precio: 1500, categoria: "bouquets", imagen: "img/productos/bouquet-rosas.jpg", descripcion: "Incluye bandita personalizada ✨" },
  { nombre: "Bouquet de 10 tulipanes", precio: 1400, categoria: "bouquets", imagen: "img/productos/bouquet-peluche.jpg", descripcion: "🌷 No incluye el peluche" },
  { nombre: "Arreglo primaveral", precio: 1500, categoria: "arreglos", imagen: "img/productos/primaveral.jpg" },
  { nombre: "Caja de rosas", precio: 1500, categoria: "arreglos", imagen: "img/productos/caja-rosas.jpg" },
  { nombre: "Cruz fúnebre", precio: 1800, categoria: "funerales", imagen: "img/productos/cruz.jpg" },
  { nombre: "Corona fúnebre", precio: null, categoria: "funerales", imagen: "img/carrusel/foto4.jpg" },
];

// ===== 2. Elementos del HTML que vamos a usar =====
const contenedor = document.getElementById("productos");
const botonesFiltro = document.querySelectorAll(".filtro");

// ===== 3. Función que crea las tarjetas =====
function mostrarProductos(lista) {
  contenedor.innerHTML = "";

  lista.forEach((producto) => {
    const indice = productos.indexOf(producto); // Posición en la lista original
    const tienePrecio = typeof producto.precio === "number";

    // Si tiene precio: se puede agregar al pedido.
    // Si no: se muestra "Precio por cotización" y un botón para cotizar por WhatsApp.
    const precioHTML = tienePrecio
      ? `<p class="producto-precio">$${producto.precio.toLocaleString("es-MX")}</p>`
      : `<p class="producto-precio sin-precio">Precio por cotización</p>`;

    const mensajeConsulta = `Hola, quiero cotizar: ${producto.nombre}`;
    const botonHTML = tienePrecio
      ? `<button class="btn btn-agregar" data-indice="${indice}">Agregar al pedido</button>`
      : `<a class="btn" target="_blank" href="https://wa.me/${TELEFONO}?text=${encodeURIComponent(mensajeConsulta)}">Solicitar cotización</a>`;

    contenedor.innerHTML += `
      <article class="producto">
        <div class="producto-img">
          <img src="${producto.imagen}" alt="${producto.nombre}" loading="lazy" onerror="this.remove()">
        </div>
        <div class="producto-info">
          <span class="producto-categoria">${producto.categoria}</span>
          <h3>${producto.nombre}</h3>
          ${producto.descripcion ? `<p class="producto-descripcion">${producto.descripcion}</p>` : ""}
          ${precioHTML}
          ${botonHTML}
        </div>
      </article>
    `;
  });
}

// ===== 4. Filtros =====
botonesFiltro.forEach((boton) => {
  boton.addEventListener("click", () => {
    // Quita "activo" de todos y se lo pone al botón presionado
    botonesFiltro.forEach((b) => b.classList.remove("activo"));
    boton.classList.add("activo");

    const categoria = boton.dataset.categoria;

    if (categoria === "todos") {
      mostrarProductos(productos);
    } else {
      mostrarProductos(productos.filter((p) => p.categoria === categoria));
    }
  });
});

// ===== 5. Mostrar todo al cargar la página =====
mostrarProductos(productos);
// ===== 6. Menú para celular =====
const menuBoton = document.getElementById("menuBoton");
const nav = document.querySelector(".nav");

menuBoton.addEventListener("click", () => {
  nav.classList.toggle("abierto");
});

// Cierra el menú al tocar un link
nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => nav.classList.remove("abierto"));
});
// ===== 7. Sombra del header al hacer scroll =====
const header = document.querySelector(".header");

window.addEventListener("scroll", () => {
  header.classList.toggle("con-sombra", window.scrollY > 50);
});
// ===== 8. Animaciones al hacer scroll =====
const observador = new IntersectionObserver((entradas) => {
  entradas.forEach((entrada) => {
    if (entrada.isIntersecting) {
      entrada.target.classList.add("visible");
      observador.unobserve(entrada.target); // Solo se anima una vez
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll(".aparecer").forEach((el) => observador.observe(el));
// ===== 9. Año automático en el footer =====
document.getElementById("anio").textContent = new Date().getFullYear();
// ===== 10. Carrusel =====
const pista = document.getElementById("carruselPista");
const fotos = pista.querySelectorAll("img");
const contenedorPuntos = document.getElementById("carruselPuntos");
let actual = 0;
let intervalo;

// Crea un puntito por cada foto
fotos.forEach((foto, i) => {
  const punto = document.createElement("button");
  punto.classList.add("punto");
  punto.setAttribute("aria-label", `Ir a la foto ${i + 1}`);
  punto.addEventListener("click", () => irA(i));
  contenedorPuntos.appendChild(punto);
});
const puntos = contenedorPuntos.querySelectorAll(".punto");

function irA(indice) {
  // Si pasa de la última foto regresa a la primera, y al revés
  actual = (indice + fotos.length) % fotos.length;
  pista.style.transform = `translateX(-${actual * 100}%)`;
  puntos.forEach((p, i) => p.classList.toggle("activo", i === actual));
  reiniciarAutomatico();
}

// Cambia de foto solo cada 5 segundos
function reiniciarAutomatico() {
  clearInterval(intervalo);
  intervalo = setInterval(() => irA(actual + 1), 5000);
}

document.getElementById("carruselAnterior").addEventListener("click", () => irA(actual - 1));
document.getElementById("carruselSiguiente").addEventListener("click", () => irA(actual + 1));

// Deslizar con el dedo en celular
let inicioX = 0;
pista.addEventListener("touchstart", (e) => (inicioX = e.touches[0].clientX));
pista.addEventListener("touchend", (e) => {
  const diferencia = e.changedTouches[0].clientX - inicioX;
  if (diferencia > 50) irA(actual - 1);
  if (diferencia < -50) irA(actual + 1);
});

irA(0);
// ===== 11. Carrito de pedido =====
let carrito = []; // Cada elemento es: { indice, cantidad }
let temporizadorAviso;

const panelCarrito = document.getElementById("carrito");
const fondoCarrito = document.getElementById("carritoFondo");
const listaCarrito = document.getElementById("carritoLista");
const totalCarrito = document.getElementById("carritoTotal");
const contadorCarrito = document.getElementById("carritoContador");
const botonEnviar = document.getElementById("carritoEnviar");
const aviso = document.getElementById("aviso");

// --- Abrir y cerrar el panel ---
function abrirCarrito() {
  panelCarrito.classList.add("abierto");
  fondoCarrito.classList.add("abierto");
}
function cerrarCarrito() {
  panelCarrito.classList.remove("abierto");
  fondoCarrito.classList.remove("abierto");
}
document.getElementById("carritoBoton").addEventListener("click", abrirCarrito);
document.getElementById("carritoCerrar").addEventListener("click", cerrarCarrito);
fondoCarrito.addEventListener("click", cerrarCarrito);

// --- Aviso pequeño abajo ---
function mostrarAviso(texto) {
  aviso.textContent = texto;
  aviso.classList.add("visible");
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => aviso.classList.remove("visible"), 2000);
}

// --- Agregar un producto ---
function agregarAlCarrito(indice) {
  const existente = carrito.find((item) => item.indice === indice);

  if (existente) {
    existente.cantidad++;
  } else {
    carrito.push({ indice: indice, cantidad: 1 });
  }

  mostrarCarrito();
  mostrarAviso(`✓ ${productos[indice].nombre} agregado`);
}

// Clic en "Agregar al pedido" (funciona aunque las tarjetas se vuelvan a crear)
contenedor.addEventListener("click", (e) => {
  const boton = e.target.closest(".btn-agregar");
  if (!boton) return;
  agregarAlCarrito(Number(boton.dataset.indice));
});

// --- Dibujar el carrito ---
function mostrarCarrito() {
  if (carrito.length === 0) {
    listaCarrito.innerHTML = `<p class="carrito-vacio">Tu pedido está vacío 🌸</p>`;
  } else {
    listaCarrito.innerHTML = carrito
      .map((item, i) => {
        const p = productos[item.indice];
        return `
          <div class="carrito-item">
            <img src="${p.imagen}" alt="${p.nombre}" onerror="this.style.visibility='hidden'">
            <div class="carrito-item-info">
              <h4>${p.nombre}</h4>
              <p>$${(p.precio * item.cantidad).toLocaleString("es-MX")}</p>
            </div>
            <div class="carrito-cantidad">
              <button data-i="${i}" data-cambio="-1">−</button>
              <span>${item.cantidad}</span>
              <button data-i="${i}" data-cambio="1">+</button>
            </div>
          </div>
        `;
      })
      .join("");
  }

  const total = carrito.reduce((suma, item) => suma + productos[item.indice].precio * item.cantidad, 0);
  const piezas = carrito.reduce((suma, item) => suma + item.cantidad, 0);

  totalCarrito.textContent = `$${total.toLocaleString("es-MX")}`;
  contadorCarrito.textContent = piezas;
  botonEnviar.disabled = carrito.length === 0;
}

// --- Botones + y − ---
listaCarrito.addEventListener("click", (e) => {
  const boton = e.target.closest("button");
  if (!boton) return;

  const i = Number(boton.dataset.i);
  carrito[i].cantidad += Number(boton.dataset.cambio);

  if (carrito[i].cantidad <= 0) {
    carrito.splice(i, 1); // Si llega a 0, se quita del pedido
  }
  mostrarCarrito();
});

// --- Continuar: cierra el carrito y abre el formulario de datos (sección 13) ---
botonEnviar.addEventListener("click", () => {
  cerrarCarrito();
  abrirFormulario("carrito");
});

// Texto con los productos del carrito (se usa al enviar el pedido)
function detalleCarrito() {
  let texto = "Hola, quiero hacer este pedido:\n\n";
  carrito.forEach((item) => {
    const p = productos[item.indice];
    texto += `• ${item.cantidad} x ${p.nombre} - $${(p.precio * item.cantidad).toLocaleString("es-MX")}\n`;
  });
  texto += `\nTotal: ${totalCarrito.textContent}\n`;
  return texto;
}

mostrarCarrito();

// ===== 12. Arma tu ramo (pedido personalizado) =====
// Para agregar o quitar flores, solo cambia esta lista.
// - Si una flor tiene un solo color, no aparece la opción de segundo color.
const floresDisponibles = [
  { nombre: "Rosas", icono: "🌹", colores: ["Rojo", "Rosa", "Blanco", "Rosa pastel", "Amarillo"] },
  { nombre: "Tulipanes", icono: "🌷", colores: ["Rosa", "Blanco", "Rojo", "Amarillo", "Morado"] },
  { nombre: "Girasoles", icono: "🌻", colores: ["Amarillo"] },
  { nombre: "Lilis", icono: "🌸", colores: ["Blanco", "Rosa"] },
  { nombre: "Gerberas", icono: "🌼", colores: ["Rosa", "Naranja", "Amarillo", "Rojo"] },
  { nombre: "Lisianthus", icono: "💐", colores: ["Blanco", "Rosa", "Morado"] },
  { nombre: "Gypsophila", icono: "☁️", colores: ["Blanco"] },
];

// Extras que se piden por cantidad (la bandita va aparte porque lleva texto)
const extrasDisponibles = [
  { nombre: "Peluche", icono: "🧸", max: 5 },
  { nombre: "Globo", icono: "🎈", max: 10 },
  { nombre: "Chocolates", icono: "🍫", max: 20 },
  { nombre: "Mariposas decorativas", icono: "🦋", max: 20 },
];

const MAX_ENVOLTURAS = 2;

const seccionRamo = document.getElementById("personalizado");
const floresGrid = document.getElementById("floresGrid");
const extrasLista = document.getElementById("extrasLista");
const resumenRamo = document.getElementById("resumenRamo");
const checkBandita = document.getElementById("checkBandita");
const campoBandita = document.getElementById("campoBandita");
const envolturaFlorista = document.getElementById("envolturaFlorista");
const tamanoCaja = document.getElementById("tamanoCaja");

// Devuelve el HTML de un contador (− número +)
function contadorHTML(nombre, max, clase = "") {
  return `
    <div class="contador ${clase}">
      <button type="button" data-cambio="-1" aria-label="Quitar ${nombre}">−</button>
      <input class="flor-cantidad" type="number" min="0" max="${max}" value="0" aria-label="Cantidad de ${nombre}">
      <button type="button" data-cambio="1" aria-label="Agregar ${nombre}">+</button>
    </div>
  `;
}

// --- Crear una tarjeta por cada flor ---
floresGrid.innerHTML = floresDisponibles
  .map((flor, i) => {
    const opciones = flor.colores.map((color) => `<option>${color}</option>`).join("");
    // El segundo color solo aparece si la flor tiene más de un color
    const segundoColor =
      flor.colores.length > 1
        ? `<select class="flor-color2" aria-label="Segundo color de ${flor.nombre}">
             <option value="">+ Otro color</option>${opciones}
           </select>`
        : "";
    return `
      <div class="flor-card" data-i="${i}">
        <div class="flor-nombre">${flor.icono} ${flor.nombre}</div>
        <div class="flor-colores">
          <select class="flor-color" aria-label="Color de ${flor.nombre}">${opciones}</select>
          ${segundoColor}
        </div>
        ${contadorHTML(flor.nombre, 200)}
      </div>
    `;
  })
  .join("");

// --- Crear una fila por cada extra ---
extrasLista.innerHTML = extrasDisponibles
  .map(
    (extra, i) => `
    <div class="extra-item" data-i="${i}">
      <span class="extra-nombre">${extra.icono} ${extra.nombre}</span>
      ${contadorHTML(extra.nombre, extra.max, "contador-chico")}
    </div>
  `
  )
  .join("");

// --- Botones + y − (sirven para flores y extras) ---
seccionRamo.addEventListener("click", (e) => {
  const boton = e.target.closest("button[data-cambio]");
  if (!boton) return;
  const campo = boton.parentElement.querySelector(".flor-cantidad");
  const nueva = (Number(campo.value) || 0) + Number(boton.dataset.cambio);
  campo.value = Math.max(0, Math.min(Number(campo.max), nueva)); // entre 0 y el máximo
  actualizarResumen();
});

// --- Envoltura: máximo 2 colores, y "Que la florista elija" va sola ---
document.getElementById("envolturas").addEventListener("change", (e) => {
  const elegido = e.target;
  const otros = [...seccionRamo.querySelectorAll('input[name="envoltura"]')].filter((x) => x !== envolturaFlorista);

  if (elegido === envolturaFlorista && elegido.checked) {
    otros.forEach((x) => (x.checked = false));
  } else if (elegido.checked) {
    envolturaFlorista.checked = false;
    const marcados = otros.filter((x) => x.checked);
    if (marcados.length > MAX_ENVOLTURAS) {
      elegido.checked = false;
      mostrarAviso(`Puedes elegir máximo ${MAX_ENVOLTURAS} colores de envoltura`);
    }
  }
});

// --- Mostrar el campo de texto solo si eligen la bandita ---
checkBandita.addEventListener("change", () => {
  campoBandita.hidden = !checkBandita.checked;
});

// --- Cualquier cambio en la sección actualiza el resumen ---
seccionRamo.addEventListener("input", actualizarResumen);
seccionRamo.addEventListener("change", actualizarResumen);

// Lee la cantidad escrita en una tarjeta (siempre un número entero >= 0)
function leerCantidad(tarjeta) {
  return Math.max(0, Math.floor(Number(tarjeta.querySelector(".flor-cantidad").value) || 0));
}

// "Rojo" + "Blanco" -> "Rojo y Blanco"   |   "Rojo" + "" -> "Rojo"
function unirColores(color1, color2) {
  return color2 && color2 !== color1 ? `${color1} y ${color2}` : color1;
}

// --- Juntar todo lo que eligió el cliente ---
function obtenerPedido() {
  const flores = floresDisponibles
    .map((flor, i) => {
      const tarjeta = floresGrid.children[i];
      const color2 = tarjeta.querySelector(".flor-color2");
      return {
        nombre: flor.nombre,
        color: unirColores(tarjeta.querySelector(".flor-color").value, color2 ? color2.value : ""),
        cantidad: leerCantidad(tarjeta),
      };
    })
    .filter((f) => f.cantidad > 0);

  const extras = extrasDisponibles
    .map((extra, i) => ({ nombre: extra.nombre, cantidad: leerCantidad(extrasLista.children[i]) }))
    .filter((x) => x.cantidad > 0)
    .map((x) => `${x.cantidad} ${x.nombre}`);

  if (checkBandita.checked) {
    const texto = document.getElementById("textoBandita").value.trim();
    extras.push(texto ? `Bandita personalizada ("${texto}")` : "Bandita personalizada");
  }

  const envolturas = [...seccionRamo.querySelectorAll('input[name="envoltura"]:checked')].map((x) => x.value);

  // Si es caja, se agrega el tamaño: "Arreglo en caja (Mediana)"
  let tipo = seccionRamo.querySelector('input[name="tipo"]:checked').value;
  if (tipo === "Arreglo en caja") {
    tipo += ` (${seccionRamo.querySelector('input[name="tamanoCaja"]:checked').value})`;
  }

  return {
    tipo,
    flores,
    envoltura: envolturas.length ? envolturas.join(" y ") : "Que la florista elija",
    extras,
  };
}

// "2027-02-14"  ->  "14/02/2027"
function formatearFecha(valor) {
  if (!valor) return "";
  const [anio, mes, dia] = valor.split("-");
  return `${dia}/${mes}/${anio}`;
}

// Evita que un texto escrito por el cliente se interprete como código HTML
function escaparHTML(texto) {
  return texto.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
}

// --- Dibujar el resumen ---
function actualizarResumen() {
  // Muestra los tamaños solo si eligieron "Arreglo en caja"
  const tipoElegido = seccionRamo.querySelector('input[name="tipo"]:checked').value;
  tamanoCaja.hidden = tipoElegido !== "Arreglo en caja";

  // Resalta las flores y extras que tienen al menos 1
  [...floresGrid.children, ...extrasLista.children].forEach((tarjeta) => {
    tarjeta.classList.toggle("elegida", leerCantidad(tarjeta) > 0);
  });

  const p = obtenerPedido();

  if (p.flores.length === 0) {
    resumenRamo.innerHTML = `<p class="resumen-vacio">Aún no eliges flores 🌸</p>`;
    return;
  }

  const totalFlores = p.flores.reduce((suma, f) => suma + f.cantidad, 0);
  const listaFlores = p.flores.map((f) => `${f.cantidad} ${f.nombre} · ${f.color}`).join("<br>");

  resumenRamo.innerHTML = `
    <ul class="resumen-lista">
      <li><strong>Tipo</strong>${p.tipo}</li>
      <li><strong>Flores (${totalFlores})</strong>${listaFlores}</li>
      <li><strong>Envoltura</strong>${p.envoltura}</li>
      ${p.extras.length ? `<li><strong>Extras</strong>${p.extras.map(escaparHTML).join("<br>")}</li>` : ""}
    </ul>
  `;
}

// Texto con el ramo armado (se usa al enviar el pedido)
function detalleRamo() {
  const p = obtenerPedido();
  let texto = "Hola, quiero cotizar un ramo personalizado 🌷\n\n";
  texto += `Tipo: ${p.tipo}\n`;
  texto += "Flores:\n" + p.flores.map((f) => `• ${f.cantidad} ${f.nombre} (${f.color.toLowerCase()})`).join("\n") + "\n";
  texto += `Envoltura: ${p.envoltura}\n`;
  if (p.extras.length) texto += "Extras:\n" + p.extras.map((x) => `• ${x}`).join("\n") + "\n";
  return texto;
}

// --- Continuar: abre el formulario de datos (sección 13) ---
document.getElementById("enviarRamo").addEventListener("click", () => {
  if (obtenerPedido().flores.length === 0) {
    mostrarAviso("Elige al menos una flor 🌸");
    return;
  }
  abrirFormulario("ramo");
});

actualizarResumen();


// ===== 13. Formulario de datos del pedido (sirve para el carrito y para "Arma tu ramo") =====
const modalPedido = document.getElementById("modalPedido");
const modalFondo = document.getElementById("modalFondo");
const formPedido = document.getElementById("formPedido");
const camposEnvio = document.getElementById("camposEnvio");
const camposTienda = document.getElementById("camposTienda");
const etiquetaHorario = document.getElementById("etiquetaHorario");
let origenPedido = "carrito"; // de dónde viene el pedido: "carrito" o "ramo"

// Fecha de hoy en formato AAAA-MM-DD (con la hora local, no la de Londres)
function fechaDeHoy() {
  const hoy = new Date();
  hoy.setMinutes(hoy.getMinutes() - hoy.getTimezoneOffset());
  return hoy.toISOString().slice(0, 10);
}
document.getElementById("pedidoFecha").min = fechaDeHoy();

// --- Abrir y cerrar la ventana ---
function abrirFormulario(origen) {
  origenPedido = origen;
  modalPedido.classList.add("abierto");
  modalFondo.classList.add("abierto");
  document.body.style.overflow = "hidden"; // evita que la página se mueva detrás
  setTimeout(() => document.getElementById("clienteNombre").focus(), 300);
}
function cerrarFormulario() {
  modalPedido.classList.remove("abierto");
  modalFondo.classList.remove("abierto");
  document.body.style.overflow = "";
}
document.getElementById("modalCerrar").addEventListener("click", cerrarFormulario);
modalFondo.addEventListener("click", cerrarFormulario);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    cerrarFormulario();
    cerrarCarrito();
  }
});

// --- Envío o tienda: muestra los campos que corresponden ---
function tipoDeEntrega() {
  return formPedido.querySelector('input[name="entrega"]:checked').value;
}
formPedido.addEventListener("change", (e) => {
  if (e.target.name !== "entrega") return;
  const esEnvio = tipoDeEntrega() === "Envío a domicilio";
  camposEnvio.hidden = !esEnvio;
  camposTienda.hidden = esEnvio;
  etiquetaHorario.innerHTML = `${esEnvio ? "Horario de entrega" : "Horario en que pasas"} <b class="obligatorio">*</b>`;
});

// --- Herramientas para revisar los campos ---
function valorDe(id) {
  return document.getElementById(id).value.trim();
}
// Deja solo 10 dígitos: "+52 871-783-0276" -> "8717830276"
function diezDigitos(texto) {
  let digitos = texto.replace(/\D/g, "");
  if (digitos.length === 12 && digitos.startsWith("52")) digitos = digitos.slice(2);
  return digitos;
}
// "8717830276" -> "871 783 0276"
function formatearCelular(digitos) {
  return `${digitos.slice(0, 3)} ${digitos.slice(3, 6)} ${digitos.slice(6)}`;
}
// Revisa un campo; si no cumple, lo marca en rojo. Por defecto revisa que no esté vacío.
function revisar(id, esValido = (valor) => valor !== "") {
  const ok = esValido(valorDe(id));
  document.getElementById(id).closest(".campo").classList.toggle("error", !ok);
  return ok;
}
// Al escribir en un campo marcado en rojo, se quita la marca
document.addEventListener("input", (e) => {
  const campo = e.target.closest && e.target.closest(".campo.error");
  if (campo) campo.classList.remove("error");
});

// --- Enviar ---
formPedido.addEventListener("submit", (e) => {
  e.preventDefault(); // evita que la página se recargue
  const esEnvio = tipoDeEntrega() === "Envío a domicilio";

  // Se revisan TODOS los campos para marcar en rojo todos los que falten de una vez
  const resultados = [
    revisar("clienteNombre"),
    revisar("clienteCelular", (v) => diezDigitos(v).length === 10),
    esEnvio ? revisar("recibeNombre") : revisar("recogeNombre"),
    esEnvio ? revisar("direccion") : true,
    revisar("pedidoFecha", (v) => v !== "" && v >= fechaDeHoy()),
    revisar("pedidoHorario"),
  ];
  if (resultados.includes(false)) {
    mostrarAviso("Revisa los campos marcados en rojo");
    formPedido.querySelector(".campo.error input, .campo.error select").focus();
    return;
  }

  let mensaje = origenPedido === "ramo" ? detalleRamo() : detalleCarrito();
  mensaje += "\n— Datos del pedido —\n";
  mensaje += `Pedido a nombre de: ${valorDe("clienteNombre")}\n`;
  mensaje += `Celular: ${formatearCelular(diezDigitos(valorDe("clienteCelular")))}\n`;
  mensaje += `Entrega: ${tipoDeEntrega()}\n`;
  if (esEnvio) {
    mensaje += `Recibe: ${valorDe("recibeNombre")}\n`;
    mensaje += `Ubicación: ${valorDe("direccion")}\n`;
    if (valorDe("referencias")) mensaje += `Referencias: ${valorDe("referencias")}\n`;
  } else {
    mensaje += `Recoge: ${valorDe("recogeNombre")}\n`;
  }
  mensaje += `Fecha: ${formatearFecha(valorDe("pedidoFecha"))}\n`;
  mensaje += `Horario: ${valorDe("pedidoHorario")}\n`;
  if (valorDe("notaMensaje")) mensaje += `Tarjeta: "${valorDe("notaMensaje")}"\n`;
  if (valorDe("notaDeParte")) mensaje += `De parte de: ${valorDe("notaDeParte")}\n`;
  mensaje += `Forma de pago: ${formPedido.querySelector('input[name="pagoPedido"]:checked').value}\n`;

  window.open(`https://wa.me/${TELEFONO}?text=${encodeURIComponent(mensaje)}`, "_blank");
  cerrarFormulario();
});


// ===== 14. Cotización de bodas y eventos =====
const formEvento = document.getElementById("formEvento");
document.getElementById("eventoFecha").min = fechaDeHoy();

formEvento.addEventListener("submit", (e) => {
  e.preventDefault();

  const resultados = [
    revisar("eventoFecha", (v) => v !== "" && v >= fechaDeHoy()),
    revisar("eventoNombre"),
    revisar("eventoCelular", (v) => diezDigitos(v).length === 10),
  ];
  if (resultados.includes(false)) {
    mostrarAviso("Revisa los campos marcados en rojo");
    formEvento.querySelector(".campo.error input").focus();
    return;
  }

  const necesita = [...formEvento.querySelectorAll('input[name="eventoIncluye"]:checked')].map((x) => x.value);

  let mensaje = "Hola, quiero cotizar flores para un evento 💐\n\n";
  mensaje += `Evento: ${valorDe("eventoTipo")}\n`;
  mensaje += `Fecha: ${formatearFecha(valorDe("eventoFecha"))}\n`;
  if (valorDe("eventoLugar")) mensaje += `Lugar: ${valorDe("eventoLugar")}\n`;
  if (valorDe("eventoInvitados")) mensaje += `Invitados: ${valorDe("eventoInvitados")}\n`;
  if (valorDe("eventoColores")) mensaje += `Colores o temática: ${valorDe("eventoColores")}\n`;
  if (necesita.length) mensaje += "Necesito:\n" + necesita.map((x) => `• ${x}`).join("\n") + "\n";
  if (valorDe("eventoComentarios")) mensaje += `Comentarios: ${valorDe("eventoComentarios")}\n`;
  mensaje += `\nNombre: ${valorDe("eventoNombre")}\n`;
  mensaje += `Celular: ${formatearCelular(diezDigitos(valorDe("eventoCelular")))}\n`;

  window.open(`https://wa.me/${TELEFONO}?text=${encodeURIComponent(mensaje)}`, "_blank");
});

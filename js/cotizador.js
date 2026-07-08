let servicios = [];
let servicioSeleccionado = null;

const contenedorServicios = document.querySelector("#contenedor-servicios");
const resumenCotizacion = document.querySelector("#resumen-cotizacion");
const inputPaginas = document.querySelector("#cotizador-paginas");
const inputNombre = document.querySelector("#cotizador-nombre");
const inputEmail = document.querySelector("#cotizador-email");
const inputWeb = document.querySelector("#cotizador-web");
const botonGenerar = document.querySelector("#btn-generar-cotizacion");

const formatoMoneda = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN"
});

document.addEventListener("DOMContentLoaded", () => {
  cargarServicios();

  if (inputPaginas) {
    inputPaginas.addEventListener("input", mostrarResumenCotizacion);
  }

  if (botonGenerar) {
    botonGenerar.addEventListener("click", generarSolicitudCotizacion);
  }
});

async function cargarServicios() {
  try {
    const respuesta = await fetch("./data/servicios.json");

    if (!respuesta.ok) {
      throw new Error("No se pudieron cargar los servicios");
    }

    servicios = await respuesta.json();
    mostrarServicios(servicios);
  } catch (error) {
    mostrarErrorCarga();
  }
}

function mostrarServicios(listaServicios) {
  contenedorServicios.textContent = "";

  listaServicios.forEach((servicio) => {
    const tarjeta = document.createElement("article");
    tarjeta.classList.add("tarjeta-servicio");
    tarjeta.dataset.id = servicio.id;

    const contenido = document.createElement("div");

    const etiqueta = document.createElement("span");
    etiqueta.classList.add("tarjeta-servicio__etiqueta");
    etiqueta.textContent = servicio.nivel;

    const titulo = document.createElement("h3");
    titulo.textContent = servicio.nombre;

    const descripcion = document.createElement("p");
    descripcion.textContent = servicio.descripcion;

    contenido.appendChild(etiqueta);
    contenido.appendChild(titulo);
    contenido.appendChild(descripcion);

    const footer = document.createElement("div");
    footer.classList.add("tarjeta-servicio__footer");

    const precio = document.createElement("strong");
    precio.textContent = `${formatoMoneda.format(servicio.precioBase)} MXN por sección`;

    const boton = document.createElement("button");
    boton.type = "button";
    boton.classList.add("btn-seleccionar-servicio");
    boton.dataset.id = servicio.id;
    boton.textContent = "Seleccionar";

    boton.addEventListener("click", () => {
      const idServicio = Number(boton.dataset.id);
      seleccionarServicio(idServicio);
    });

    footer.appendChild(precio);
    footer.appendChild(boton);

    tarjeta.appendChild(contenido);
    tarjeta.appendChild(footer);

    contenedorServicios.appendChild(tarjeta);
  });
}

function seleccionarServicio(idServicio) {
  servicioSeleccionado = servicios.find((servicio) => servicio.id === idServicio);

  const tarjetas = document.querySelectorAll(".tarjeta-servicio");

  tarjetas.forEach((tarjeta) => {
    tarjeta.classList.remove("tarjeta-servicio--activa");

    if (Number(tarjeta.dataset.id) === idServicio) {
      tarjeta.classList.add("tarjeta-servicio--activa");
    }
  });

  mostrarResumenCotizacion();
}

function calcularTotal(precioBase, paginas) {
  return precioBase * paginas;
}

function mostrarResumenCotizacion() {
  if (!resumenCotizacion) {
    return;
  }

  resumenCotizacion.textContent = "";

  if (!servicioSeleccionado) {
    const mensaje = document.createElement("p");
    mensaje.classList.add("mensaje-cotizador");
    mensaje.textContent = "Selecciona un servicio para ver tu cotización estimada.";

    resumenCotizacion.appendChild(mensaje);
    return;
  }

  const paginas = Number(inputPaginas.value) || 1;
  const total = calcularTotal(servicioSeleccionado.precioBase, paginas);

  const titulo = document.createElement("h3");
  titulo.textContent = "Resumen de cotización";

  const servicio = document.createElement("p");
  servicio.innerHTML = `<strong>Servicio seleccionado:</strong> ${servicioSeleccionado.nombre}`;

  const nivel = document.createElement("p");
  nivel.innerHTML = `<strong>Nivel:</strong> ${servicioSeleccionado.nivel}`;

  const secciones = document.createElement("p");
  secciones.innerHTML = `<strong>Páginas o secciones:</strong> ${paginas}`;

  const totalContenedor = document.createElement("div");
  totalContenedor.classList.add("total-cotizacion");

  const totalTexto = document.createElement("span");
  totalTexto.textContent = "Total estimado:";

  const totalPrecio = document.createElement("strong");
  totalPrecio.textContent = `${formatoMoneda.format(total)} MXN`;

  totalContenedor.appendChild(totalTexto);
  totalContenedor.appendChild(totalPrecio);

  const nota = document.createElement("p");
  nota.classList.add("nota-cotizacion");
  nota.textContent = "Esta cotización es una estimación inicial. El costo final puede ajustarse después de revisar el sitio.";

  resumenCotizacion.appendChild(titulo);
  resumenCotizacion.appendChild(servicio);
  resumenCotizacion.appendChild(nivel);
  resumenCotizacion.appendChild(secciones);
  resumenCotizacion.appendChild(totalContenedor);
  resumenCotizacion.appendChild(nota);
}

function generarSolicitudCotizacion() {
  const paginas = Number(inputPaginas.value);
  const nombre = inputNombre.value.trim();
  const email = inputEmail.value.trim();
  const web = inputWeb.value.trim();

  if (!servicioSeleccionado) {
    Swal.fire({
      icon: "warning",
      title: "Selecciona un servicio",
      text: "Elige una de las tarjetas para generar tu cotización.",
      confirmButtonText: "Entendido"
    });
    return;
  }

  if (!paginas || paginas < 1) {
    Swal.fire({
      icon: "warning",
      title: "Dato pendiente",
      text: "Indica cuántas páginas o secciones tiene tu sitio.",
      confirmButtonText: "Entendido"
    });
    return;
  }

  if (nombre === "" || email === "" || web === "") {
    Swal.fire({
      icon: "warning",
      title: "Completa tus datos",
      text: "Necesitamos tu nombre, correo y sitio web para generar la solicitud.",
      confirmButtonText: "Entendido"
    });
    return;
  }

  const total = calcularTotal(servicioSeleccionado.precioBase, paginas);

  const cotizacion = {
    nombre,
    email,
    web,
    paginas,
    servicio: servicioSeleccionado.nombre,
    nivel: servicioSeleccionado.nivel,
    total
  };

  localStorage.setItem("ultimaCotizacionStella", JSON.stringify(cotizacion));

  Swal.fire({
    icon: "success",
    title: "Solicitud recibida",
    html: `
      <p>Hemos recibido tu solicitud, nos comunicaremos contigo lo antes posible.</p>

      <div class="alerta-resumen-cotizacion">
        <p><strong>Servicio:</strong> ${servicioSeleccionado.nombre}</p>
        <p><strong>Nivel:</strong> ${servicioSeleccionado.nivel}</p>
        <p><strong>Secciones:</strong> ${paginas}</p>
        <p><strong>Total estimado:</strong> ${formatoMoneda.format(total)} MXN</p>
      </div>
    `,
    confirmButtonText: "Entendido"
  });
}

function mostrarErrorCarga() {
  contenedorServicios.textContent = "";

  const error = document.createElement("div");
  error.classList.add("error-cotizador");

  const titulo = document.createElement("h3");
  titulo.textContent = "No se pudieron cargar los servicios";

  const mensaje = document.createElement("p");
  mensaje.textContent = "Intenta actualizar la página o revisa que el archivo servicios.json esté disponible.";

  error.appendChild(titulo);
  error.appendChild(mensaje);

  contenedorServicios.appendChild(error);
}
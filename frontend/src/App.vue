<script setup>
import { onMounted, ref } from 'vue';

const apiUrl = import.meta.env.VITE_API_URL ;

const vista = ref('login');
const nombre = ref('');
const correo = ref('');
const password = ref('');
const usuario = ref(null);
const perfiles = ref([]);
const perfilSeleccionado = ref(null);
const cargando = ref(false);
const mensaje = ref('');
const error = ref('');

const token = ref(localStorage.getItem('token') || '');

function limpiarMensajes() {
  mensaje.value = '';
  error.value = '';
}

function limpiarFormulario() {
  nombre.value = '';
  correo.value = '';
  password.value = '';
}

function guardarSesion(data) {
  token.value = data.accessToken;
  usuario.value = data.usuario;
  localStorage.setItem('token', data.accessToken);
  vista.value = 'perfiles';
  cargarPerfiles();
}

async function cargarPerfiles() {
  try {
    const respuesta = await fetch(`${apiUrl}/usuarios`, {
      headers: { Authorization: `Bearer ${token.value}` },
    });
    const data = await respuesta.json();
    if (!respuesta.ok) throw new Error(data.message || 'No se pudieron cargar los perfiles.');
    perfiles.value = data;
  } catch (e) {
    error.value = e.message || 'No se pudieron cargar los perfiles.';
  }
}

async function abrirPerfil(perfil) {
  limpiarMensajes();
  cargando.value = true;
  try {
    const respuesta = await fetch(`${apiUrl}/usuarios/${perfil.id}/visitas`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token.value}` },
    });
    const data = await respuesta.json();
    if (!respuesta.ok) throw new Error(data.message || 'No se pudo visitar el perfil.');
    perfilSeleccionado.value = data;
    perfiles.value = perfiles.value.map((item) => item.id === data.id ? data : item);
    vista.value = 'perfilVisitado';
  } catch (e) {
    error.value = e.message || 'No se pudo visitar el perfil.';
  } finally {
    cargando.value = false;
  }
}

async function registro() {
  limpiarMensajes();
  cargando.value = true;

  try {
    const respuesta = await fetch(`${apiUrl}/auth/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: nombre.value,
        correo: correo.value,
        password: password.value,
      }),
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(
        Array.isArray(data.message) ? data.message.join(', ') : data.message
      );
    }

    guardarSesion(data);
    limpiarFormulario();
    mensaje.value = 'Usuario registrado correctamente.';
  } catch (e) {
    error.value = e.message || 'No se pudo registrar.';
  } finally {
    cargando.value = false;
  }
}

async function login() {
  limpiarMensajes();
  cargando.value = true;

  try {
    const respuesta = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        correo: correo.value,
        password: password.value,
      }),
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(data.message || 'No se pudo iniciar sesión.');
    }

    guardarSesion(data);
    limpiarFormulario();
    mensaje.value = 'Inicio de sesión correcto.';
  } catch (e) {
    error.value = e.message || 'No se pudo iniciar sesión.';
  } finally {
    cargando.value = false;
  }
}

async function cargarPerfil() {
  if (!token.value) return;

  try {
    const respuesta = await fetch(`${apiUrl}/usuarios/perfil`, {
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (!respuesta.ok) {
      cerrarSesion();
      return;
    }

    usuario.value = await respuesta.json();
    vista.value = 'perfiles';
    await cargarPerfiles();
  } catch {
    error.value = 'No se pudo conectar con el servidor.';
  }
}

async function sumarVisita() {
  limpiarMensajes();
  cargando.value = true;

  try {
    const respuesta = await fetch(`${apiUrl}/usuarios/visitas`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(data.message || 'No se pudo sumar la visita.');
    }

    usuario.value = data;
    mensaje.value = 'Visita sumada correctamente.';
  } catch (e) {
    error.value = e.message || 'No se pudo sumar la visita.';
  } finally {
    cargando.value = false;
  }
}

function cerrarSesion() {
  localStorage.removeItem('token');
  token.value = '';
  usuario.value = null;
  perfiles.value = [];
  perfilSeleccionado.value = null;
  limpiarFormulario();
  limpiarMensajes();
  vista.value = 'login';
}

function irA(nuevaVista) {
  vista.value = nuevaVista;
  limpiarMensajes();
  limpiarFormulario();
}

onMounted(() => {
  if (token.value) {
    cargarPerfil();
  }
});
</script>

<template>
  <main class="page">
    <section v-if="vista === 'login'" class="card auth-card">
      <div class="logo">V</div>
      <p class="eyebrow">VISITAS APP</p>
      <h1>Iniciar sesión</h1>
      <p class="subtitle">Accede a tu perfil y administra tus visitas.</p>

      <form class="form" @submit.prevent="login">
        <label>
          Correo
          <input
            v-model="correo"
            type="email"
            required
            placeholder="correo@ejemplo.com"
          />
        </label>

        <label>
          Contraseña
          <input
            v-model="password"
            type="password"
            required
            minlength="6"
            placeholder="••••••••"
          />
        </label>

        <button :disabled="cargando" type="submit">
          {{ cargando ? 'Ingresando...' : 'Iniciar sesión' }}
        </button>
      </form>

      <p class="switch">
        ¿No tienes una cuenta?
        <button class="link-button" @click="irA('registro')">Regístrate</button>
      </p>

      <p v-if="error" class="alert error">{{ error }}</p>
      <p v-if="mensaje" class="alert success">{{ mensaje }}</p>
    </section>

    <section v-else-if="vista === 'registro'" class="card auth-card">
      <div class="logo">V</div>
      <p class="eyebrow">CREAR CUENTA</p>
      <h1>Registrar usuario</h1>
      <p class="subtitle">Crea tu usuario para acceder al perfil.</p>

      <form class="form" @submit.prevent="registro">
        <label>
          Nombre
          <input
            v-model="nombre"
            type="text"
            required
            maxlength="100"
            placeholder="Tu nombre"
          />
        </label>

        <label>
          Correo
          <input
            v-model="correo"
            type="email"
            required
            placeholder="correo@ejemplo.com"
          />
        </label>

        <label>
          Contraseña
          <input
            v-model="password"
            type="password"
            required
            minlength="6"
            placeholder="Mínimo 6 caracteres"
          />
        </label>

        <button :disabled="cargando" type="submit">
          {{ cargando ? 'Registrando...' : 'Crear cuenta' }}
        </button>
      </form>

      <p class="switch">
        ¿Ya tienes cuenta?
        <button class="link-button" @click="irA('login')">Inicia sesión</button>
      </p>

      <p v-if="error" class="alert error">{{ error }}</p>
    </section>

    <section v-else-if="vista === 'perfiles' && usuario" class="profiles-page">
      <header class="profiles-header card">
        <div>
          <p class="eyebrow">PERFILES CREADOS</p>
          <h1>Hola, {{ usuario.nombre }}</h1>
          <p class="subtitle">Selecciona un perfil para visitarlo.</p>
        </div>
        <button class="logout" @click="cerrarSesion">Cerrar sesión</button>
      </header>

      <div class="profiles-grid">
        <button
          v-for="perfil in perfiles"
          :key="perfil.id"
          class="profile-preview"
          :disabled="cargando"
          @click="abrirPerfil(perfil)"
        >
          <span class="avatar">{{ perfil.nombre.charAt(0).toUpperCase() }}</span>
          <strong>{{ perfil.nombre }}</strong>
          <span>{{ perfil.visitas }} visitas</span>
        </button>
      </div>

      <p v-if="perfiles.length === 0 && !error" class="empty">Todavía no hay perfiles creados.</p>
      <p v-if="error" class="alert error">{{ error }}</p>
    </section>

    <section v-else-if="vista === 'perfilVisitado' && perfilSeleccionado" class="card profile-card">
      <header class="profile-header">
        <div>
          <p class="eyebrow">PERFIL VISITADO</p>
          <h1>{{ perfilSeleccionado.nombre }}</h1>
        </div>
        <button class="logout" @click="vista = 'perfiles'">Volver a perfiles</button>
      </header>

      <div class="visits-card">
        <span class="visits-label">Total de visitas</span>
        <strong>{{ perfilSeleccionado.visitas }}</strong>
        <p>Tu visita se agregó al abrir este perfil.</p>
      </div>
      <p v-if="error" class="alert error">{{ error }}</p>
    </section>
  </main>
</template>

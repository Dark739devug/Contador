<script setup>
import { ref } from 'vue';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const nombre = ref('');
const correo = ref('');
const usuario = ref(null);
const mensaje = ref('');
const error = ref('');
const cargando = ref(false);

async function registrarUsuario() {
  mensaje.value = '';
  error.value = '';

  if (!nombre.value.trim() || !correo.value.trim()) {
    error.value = 'Ingresa nombre y correo.';
    return;
  }

  cargando.value = true;

  try {
    const respuesta = await fetch(`${apiUrl}/usuarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nombre: nombre.value,
        correo: correo.value,
      }),
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(
        Array.isArray(data.message) ? data.message.join(', ') : data.message
      );
    }

    usuario.value = data;
    mensaje.value = 'Usuario registrado correctamente.';
  } catch (e) {
    error.value = e.message || 'No se pudo registrar el usuario.';
  } finally {
    cargando.value = false;
  }
}

async function sumarVisita() {
  if (!usuario.value) return;

  mensaje.value = '';
  error.value = '';
  cargando.value = true;

  try {
    const respuesta = await fetch(
      `${apiUrl}/usuarios/${usuario.value.id}/visitas`,
      { method: 'PATCH' }
    );

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
</script>

<template>
  <main class="page">
    <section class="card">
      <div class="brand">VISITAS APP</div>
      <h1>Registrar usuario</h1>
      <p class="subtitle">
        Crea un usuario y aumenta su contador de visitas.
      </p>

      <form @submit.prevent="registrarUsuario" class="form">
        <label>
          Nombre
          <input
            v-model="nombre"
            type="text"
            maxlength="100"
            placeholder="Ej. Esdras Perez"
          />
        </label>

        <label>
          Correo
          <input
            v-model="correo"
            type="email"
            maxlength="150"
            placeholder="correo@ejemplo.com"
          />
        </label>

        <button :disabled="cargando" type="submit">
          {{ cargando ? 'Procesando...' : 'Registrar usuario' }}
        </button>
      </form>

      <p v-if="mensaje" class="message success">{{ mensaje }}</p>
      <p v-if="error" class="message error">{{ error }}</p>
    </section>

    <section v-if="usuario" class="card user-card">
      <p class="eyebrow">Usuario registrado</p>
      <h2>{{ usuario.nombre }}</h2>
      <p>{{ usuario.correo }}</p>

      <div class="visits">
        <span>Visitas</span>
        <strong>{{ usuario.visitas }}</strong>
      </div>

      <button
        class="secondary"
        :disabled="cargando"
        @click="sumarVisita"
      >
        + Sumar visita
      </button>
    </section>
  </main>
</template>

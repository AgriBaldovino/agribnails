<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title class="text-h4">
            <v-icon large color="info" class="mr-2">mdi-account</v-icon>
            Mi Perfil
          </v-card-title>
          
          <v-card-text>
            <v-form @submit.prevent="guardarPerfil">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="perfil.nombre"
                    label="Nombre"
                    variant="outlined"
                    required
                  ></v-text-field>
                </v-col>
                
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="perfil.apellido"
                    label="Apellido"
                    variant="outlined"
                    required
                  ></v-text-field>
                </v-col>
                
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="perfil.email"
                    label="Email"
                    type="email"
                    variant="outlined"
                    required
                  ></v-text-field>
                </v-col>
                
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="perfil.telefono"
                    label="Teléfono"
                    variant="outlined"
                  ></v-text-field>
                </v-col>
                
                <v-col cols="12">
                  <v-textarea
                    v-model="perfil.direccion"
                    label="Dirección"
                    variant="outlined"
                    rows="3"
                  ></v-textarea>
                </v-col>
                
                <v-col cols="12">
                  <v-select
                    v-model="perfil.categoriasFavoritas"
                    :items="categoriasDisponibles"
                    label="Categorías Favoritas"
                    variant="outlined"
                    multiple
                    chips
                  ></v-select>
                </v-col>
              </v-row>
              
              <v-card-actions class="justify-center pa-6">
                <v-btn
                  type="submit"
                  color="primary"
                  size="large"
                  :loading="guardando"
                >
                  Guardar Cambios
                </v-btn>
              </v-card-actions>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const guardando = ref(false)

const perfil = ref({
  nombre: 'Juan',
  apellido: 'Pérez',
  email: 'juan.perez@email.com',
  telefono: '+54 11 1234-5678',
  direccion: 'Av. Corrientes 1234, Buenos Aires',
  categoriasFavoritas: ['Electrónicos', 'Ropa']
})

const categoriasDisponibles = [
  'Electrónicos',
  'Ropa',
  'Hogar',
  'Deportes',
  'Libros',
  'Juguetes',
  'Alimentos',
  'Belleza'
]

const guardarPerfil = async () => {
  guardando.value = true
  // Simular guardado
  await new Promise(resolve => setTimeout(resolve, 1000))
  guardando.value = false
  // Aquí iría la lógica real de guardado
}
</script> 
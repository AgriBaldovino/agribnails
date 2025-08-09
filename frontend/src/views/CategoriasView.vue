<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h4">
            <v-icon large color="success" class="mr-2">mdi-category</v-icon>
            Categorías
          </v-card-title>
          
          <v-card-text>
            <v-row>
              <v-col cols="12" md="3" v-for="categoria in categorias" :key="categoria.id">
                <v-card variant="outlined" class="text-center">
                  <v-card-title>{{ categoria.nombre }}</v-card-title>
                  <v-card-text>
                    <v-icon large :color="categoria.color" class="mb-2">
                      {{ categoria.icono }}
                    </v-icon>
                    <p>{{ categoria.descripcion }}</p>
                    <p><strong>{{ categoria.cantidad }}</strong> descuentos disponibles</p>
                  </v-card-text>
                  <v-card-actions class="justify-center">
                    <v-btn color="primary" variant="outlined">
                      Explorar
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const categorias = ref([
  {
    id: 1,
    nombre: 'Electrónicos',
    descripcion: 'Smartphones, laptops, tablets y más',
    icono: 'mdi-laptop',
    color: 'primary',
    cantidad: 15
  },
  {
    id: 2,
    nombre: 'Ropa',
    descripcion: 'Ropa para hombres, mujeres y niños',
    icono: 'mdi-hanger',
    color: 'success',
    cantidad: 25
  },
  {
    id: 3,
    nombre: 'Hogar',
    descripcion: 'Muebles, decoración y electrodomésticos',
    icono: 'mdi-home',
    color: 'info',
    cantidad: 20
  },
  {
    id: 4,
    nombre: 'Deportes',
    descripcion: 'Equipamiento y ropa deportiva',
    icono: 'mdi-bike',
    color: 'warning',
    cantidad: 12
  }
])
</script> 
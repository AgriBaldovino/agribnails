<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h4">
            <v-icon large color="primary" class="mr-2">mdi-tag</v-icon>
            Descuentos Disponibles
          </v-card-title>
          
          <v-card-text>
            <v-row>
              <v-col cols="12" md="4" v-for="descuento in descuentos" :key="descuento.id">
                <v-card variant="outlined">
                  <v-card-title>{{ descuento.titulo }}</v-card-title>
                  <v-card-text>
                    <p><strong>Descuento:</strong> {{ descuento.porcentaje }}%</p>
                    <p><strong>Categoría:</strong> {{ descuento.categoria }}</p>
                    <p><strong>Válido hasta:</strong> {{ descuento.fechaVencimiento }}</p>
                  </v-card-text>
                  <v-card-actions>
                    <v-btn color="primary" variant="outlined">
                      Ver Detalles
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

const descuentos = ref([
  {
    id: 1,
    titulo: 'Descuento en Electrónicos',
    porcentaje: 20,
    categoria: 'Electrónicos',
    fechaVencimiento: '2024-12-31'
  },
  {
    id: 2,
    titulo: 'Oferta en Ropa',
    porcentaje: 15,
    categoria: 'Ropa',
    fechaVencimiento: '2024-11-30'
  },
  {
    id: 3,
    titulo: 'Descuento en Hogar',
    porcentaje: 25,
    categoria: 'Hogar',
    fechaVencimiento: '2024-10-31'
  }
])
</script> 
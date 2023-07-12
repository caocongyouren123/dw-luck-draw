import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useAppStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  function increment() {
    count.value++
  }

  const tableNameList = ref<any>([])
  
  function getNameList(value: any){
    tableNameList.value = value
  }

  return { tableNameList, getNameList, doubleCount, increment }
})

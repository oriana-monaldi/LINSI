"""
Algoritmos de Ordenamiento en Python
Curso: Algoritmos y Estructuras de Datos
Implementaciones completas con análisis de complejidad
"""

import time
import random
from typing import List


def bubble_sort(arr: List[int]) -> List[int]:
    """
    Algoritmo Bubble Sort
    Complejidad temporal: O(n²) en el peor caso, O(n) en el mejor caso
    Complejidad espacial: O(1)
    """
    n = len(arr)
    arr_copy = arr.copy()
    
    for i in range(n):
        # Bandera para optimización
        intercambiado = False
        
        for j in range(0, n - i - 1):
            if arr_copy[j] > arr_copy[j + 1]:
                arr_copy[j], arr_copy[j + 1] = arr_copy[j + 1], arr_copy[j]
                intercambiado = True
        
        # Si no hubo intercambios, la lista ya está ordenada
        if not intercambiado:
            break
    
    return arr_copy


def selection_sort(arr: List[int]) -> List[int]:
    """
    Algoritmo Selection Sort
    Complejidad temporal: O(n²) en todos los casos
    Complejidad espacial: O(1)
    """
    n = len(arr)
    arr_copy = arr.copy()
    
    for i in range(n):
        # Encontrar el índice del elemento mínimo
        min_idx = i
        for j in range(i + 1, n):
            if arr_copy[j] < arr_copy[min_idx]:
                min_idx = j
        
        # Intercambiar el elemento mínimo con el primer elemento
        arr_copy[i], arr_copy[min_idx] = arr_copy[min_idx], arr_copy[i]
    
    return arr_copy


def insertion_sort(arr: List[int]) -> List[int]:
    """
    Algoritmo Insertion Sort
    Complejidad temporal: O(n²) en el peor caso, O(n) en el mejor caso
    Complejidad espacial: O(1)
    """
    arr_copy = arr.copy()
    
    for i in range(1, len(arr_copy)):
        key = arr_copy[i]
        j = i - 1
        
        # Mover elementos mayores que key una posición adelante
        while j >= 0 and arr_copy[j] > key:
            arr_copy[j + 1] = arr_copy[j]
            j -= 1
        
        arr_copy[j + 1] = key
    
    return arr_copy


def merge_sort(arr: List[int]) -> List[int]:
    """
    Algoritmo Merge Sort
    Complejidad temporal: O(n log n) en todos los casos
    Complejidad espacial: O(n)
    """
    if len(arr) <= 1:
        return arr
    
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    
    return merge(left, right)


def merge(left: List[int], right: List[int]) -> List[int]:
    """Función auxiliar para Merge Sort"""
    resultado = []
    i = j = 0
    
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            resultado.append(left[i])
            i += 1
        else:
            resultado.append(right[j])
            j += 1
    
    # Agregar elementos restantes
    resultado.extend(left[i:])
    resultado.extend(right[j:])
    
    return resultado


def quick_sort(arr: List[int]) -> List[int]:
    """
    Algoritmo Quick Sort
    Complejidad temporal: O(n log n) promedio, O(n²) peor caso
    Complejidad espacial: O(log n) promedio
    """
    if len(arr) <= 1:
        return arr
    
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    
    return quick_sort(left) + middle + quick_sort(right)


def heap_sort(arr: List[int]) -> List[int]:
    """
    Algoritmo Heap Sort
    Complejidad temporal: O(n log n) en todos los casos
    Complejidad espacial: O(1)
    """
    arr_copy = arr.copy()
    
    # Construir max heap
    n = len(arr_copy)
    for i in range(n // 2 - 1, -1, -1):
        heapify(arr_copy, n, i)
    
    # Extraer elementos uno por uno
    for i in range(n - 1, 0, -1):
        arr_copy[0], arr_copy[i] = arr_copy[i], arr_copy[0]
        heapify(arr_copy, i, 0)
    
    return arr_copy


def heapify(arr: List[int], n: int, i: int):
    """Función auxiliar para Heap Sort"""
    largest = i
    left = 2 * i + 1
    right = 2 * i + 2
    
    if left < n and arr[left] > arr[largest]:
        largest = left
    
    if right < n and arr[right] > arr[largest]:
        largest = right
    
    if largest != i:
        arr[i], arr[largest] = arr[largest], arr[i]
        heapify(arr, n, largest)


def counting_sort(arr: List[int]) -> List[int]:
    """
    Algoritmo Counting Sort
    Complejidad temporal: O(n + k) donde k es el rango de valores
    Complejidad espacial: O(k)
    """
    if not arr:
        return arr
    
    max_val = max(arr)
    min_val = min(arr)
    range_val = max_val - min_val + 1
    
    count = [0] * range_val
    output = [0] * len(arr)
    
    # Contar ocurrencias
    for num in arr:
        count[num - min_val] += 1
    
    # Cambiar count[i] para que contenga la posición actual
    for i in range(1, range_val):
        count[i] += count[i - 1]
    
    # Construir el array resultado
    for i in range(len(arr) - 1, -1, -1):
        output[count[arr[i] - min_val] - 1] = arr[i]
        count[arr[i] - min_val] -= 1
    
    return output


def benchmark_algorithms(arr: List[int]):
    """Función para comparar el rendimiento de los algoritmos"""
    algorithms = {
        "Bubble Sort": bubble_sort,
        "Selection Sort": selection_sort,
        "Insertion Sort": insertion_sort,
        "Merge Sort": merge_sort,
        "Quick Sort": quick_sort,
        "Heap Sort": heap_sort,
        "Counting Sort": counting_sort
    }
    
    results = {}
    
    for name, func in algorithms.items():
        start_time = time.time()
        sorted_arr = func(arr)
        end_time = time.time()
        
        results[name] = {
            "time": end_time - start_time,
            "is_sorted": sorted_arr == sorted(arr)
        }
    
    return results


# Ejemplos de uso y pruebas
if __name__ == "__main__":
    print("=== ALGORITMOS DE ORDENAMIENTO ===\n")
    
    # Array de prueba pequeño
    test_array = [64, 34, 25, 12, 22, 11, 90]
    print(f"Array original: {test_array}")
    
    # Probar cada algoritmo
    algorithms = {
        "Bubble Sort": bubble_sort,
        "Selection Sort": selection_sort,
        "Insertion Sort": insertion_sort,
        "Merge Sort": merge_sort,
        "Quick Sort": quick_sort,
        "Heap Sort": heap_sort,
        "Counting Sort": counting_sort
    }
    
    for name, func in algorithms.items():
        sorted_arr = func(test_array)
        print(f"{name}: {sorted_arr}")
    
    print("\n=== BENCHMARK CON ARRAY ALEATORIO ===")
    
    # Generar array aleatorio más grande para benchmark
    random_array = [random.randint(1, 1000) for _ in range(1000)]
    
    benchmark_results = benchmark_algorithms(random_array)
    
    print(f"\nResultados del benchmark (array de {len(random_array)} elementos):")
    print("-" * 50)
    
    for name, result in sorted(benchmark_results.items(), key=lambda x: x[1]["time"]):
        status = "✓" if result["is_sorted"] else "✗"
        print(f"{name:<15}: {result['time']:.6f}s {status}")
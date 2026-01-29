# TP Algoritmos de Ordenamiento - Juan Pérez
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)

def mergesort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = mergesort(arr[:mid])
    right = mergesort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result

# Pruebas de rendimiento
import time
import random

def test_algorithms():
    sizes = [1000, 5000, 10000]
    for size in sizes:
        arr = [random.randint(1, 1000) for _ in range(size)]
        
        # Test QuickSort
        start = time.time()
        quicksort(arr.copy())
        quick_time = time.time() - start
        
        # Test MergeSort
        start = time.time()
        mergesort(arr.copy())
        merge_time = time.time() - start
        
        print(f"Size {size}: QuickSort={quick_time:.4f}s, MergeSort={merge_time:.4f}s")

if __name__ == "__main__":
    test_algorithms()

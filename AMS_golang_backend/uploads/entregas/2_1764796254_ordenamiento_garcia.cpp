// TP Algoritmos de Ordenamiento - María García
#include <iostream>
#include <vector>
#include <chrono>
#include <algorithm>
#include <random>

using namespace std;
using namespace std::chrono;

class SortingAlgorithms {
public:
    static void quickSort(vector<int>& arr, int low, int high) {
        if (low < high) {
            int pi = partition(arr, low, high);
            quickSort(arr, low, pi - 1);
            quickSort(arr, pi + 1, high);
        }
    }
    
    static void heapSort(vector<int>& arr) {
        int n = arr.size();
        for (int i = n / 2 - 1; i >= 0; i--)
            heapify(arr, n, i);
        
        for (int i = n - 1; i >= 0; i--) {
            swap(arr[0], arr[i]);
            heapify(arr, i, 0);
        }
    }

private:
    static int partition(vector<int>& arr, int low, int high) {
        int pivot = arr[high];
        int i = (low - 1);
        
        for (int j = low; j <= high - 1; j++) {
            if (arr[j] < pivot) {
                i++;
                swap(arr[i], arr[j]);
            }
        }
        swap(arr[i + 1], arr[high]);
        return (i + 1);
    }
    
    static void heapify(vector<int>& arr, int n, int i) {
        int largest = i;
        int l = 2 * i + 1;
        int r = 2 * i + 2;
        
        if (l < n && arr[l] > arr[largest])
            largest = l;
        
        if (r < n && arr[r] > arr[largest])
            largest = r;
        
        if (largest != i) {
            swap(arr[i], arr[largest]);
            heapify(arr, n, largest);
        }
    }
};

int main() {
    vector<int> sizes = {1000, 5000, 10000, 50000};
    
    for (int size : sizes) {
        vector<int> data(size);
        random_device rd;
        mt19937 gen(rd());
        uniform_int_distribution<> dis(1, 1000);
        
        for (int i = 0; i < size; i++) {
            data[i] = dis(gen);
        }
        
        // Test QuickSort
        vector<int> quickData = data;
        auto start = high_resolution_clock::now();
        SortingAlgorithms::quickSort(quickData, 0, size - 1);
        auto end = high_resolution_clock::now();
        auto quickTime = duration_cast<microseconds>(end - start);
        
        // Test HeapSort
        vector<int> heapData = data;
        start = high_resolution_clock::now();
        SortingAlgorithms::heapSort(heapData);
        end = high_resolution_clock::now();
        auto heapTime = duration_cast<microseconds>(end - start);
        
        cout << "Size " << size << ": QuickSort=" << quickTime.count() 
             << "μs, HeapSort=" << heapTime.count() << "μs" << endl;
    }
    
    return 0;
}

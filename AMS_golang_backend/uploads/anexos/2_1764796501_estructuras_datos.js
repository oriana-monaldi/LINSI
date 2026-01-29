/**
 * Ejemplos de Estructuras de Datos en JavaScript
 * Curso: Algoritmos y Estructuras de Datos
 * Año: 2024
 */

// 1. ARRAYS Y MATRICES
console.log("=== ARRAYS Y MATRICES ===");

// Array básico
let numeros = [1, 2, 3, 4, 5];
console.log("Array original:", numeros);

// Métodos de arrays
numeros.push(6);
console.log("Después de push:", numeros);

let primero = numeros.shift();
console.log("Elemento removido:", primero);
console.log("Array después de shift:", numeros);

// Matriz bidimensional
let matriz = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
];

console.log("Matriz 3x3:", matriz);
console.log("Elemento [1][2]:", matriz[1][2]);

// 2. LISTAS ENLAZADAS
console.log("\n=== LISTAS ENLAZADAS ===");

class Nodo {
    constructor(dato) {
        this.dato = dato;
        this.siguiente = null;
    }
}

class ListaEnlazada {
    constructor() {
        this.cabeza = null;
        this.tamaño = 0;
    }

    agregar(dato) {
        let nuevoNodo = new Nodo(dato);
        if (!this.cabeza) {
            this.cabeza = nuevoNodo;
        } else {
            let actual = this.cabeza;
            while (actual.siguiente) {
                actual = actual.siguiente;
            }
            actual.siguiente = nuevoNodo;
        }
        this.tamaño++;
    }

    mostrar() {
        let resultado = [];
        let actual = this.cabeza;
        while (actual) {
            resultado.push(actual.dato);
            actual = actual.siguiente;
        }
        return resultado;
    }

    buscar(dato) {
        let actual = this.cabeza;
        let indice = 0;
        while (actual) {
            if (actual.dato === dato) {
                return indice;
            }
            actual = actual.siguiente;
            indice++;
        }
        return -1;
    }
}

// Ejemplo de uso
let lista = new ListaEnlazada();
lista.agregar("A");
lista.agregar("B");
lista.agregar("C");

console.log("Lista enlazada:", lista.mostrar());
console.log("Buscar 'B':", lista.buscar("B"));

// 3. PILAS (STACKS)
console.log("\n=== PILAS (STACKS) ===");

class Pila {
    constructor() {
        this.elementos = [];
    }

    push(elemento) {
        this.elementos.push(elemento);
    }

    pop() {
        if (this.estaVacia()) {
            return null;
        }
        return this.elementos.pop();
    }

    peek() {
        if (this.estaVacia()) {
            return null;
        }
        return this.elementos[this.elementos.length - 1];
    }

    estaVacia() {
        return this.elementos.length === 0;
    }

    tamaño() {
        return this.elementos.length;
    }
}

// Ejemplo de uso
let pila = new Pila();
pila.push(10);
pila.push(20);
pila.push(30);

console.log("Pila:", pila.elementos);
console.log("Elemento en la cima:", pila.peek());
console.log("Elemento removido:", pila.pop());
console.log("Pila después de pop:", pila.elementos);

// 4. COLAS (QUEUES)
console.log("\n=== COLAS (QUEUES) ===");

class Cola {
    constructor() {
        this.elementos = [];
    }

    enqueue(elemento) {
        this.elementos.push(elemento);
    }

    dequeue() {
        if (this.estaVacia()) {
            return null;
        }
        return this.elementos.shift();
    }

    frente() {
        if (this.estaVacia()) {
            return null;
        }
        return this.elementos[0];
    }

    estaVacia() {
        return this.elementos.length === 0;
    }

    tamaño() {
        return this.elementos.length;
    }
}

// Ejemplo de uso
let cola = new Cola();
cola.enqueue("Primero");
cola.enqueue("Segundo");
cola.enqueue("Tercero");

console.log("Cola:", cola.elementos);
console.log("Frente de la cola:", cola.frente());
console.log("Elemento removido:", cola.dequeue());
console.log("Cola después de dequeue:", cola.elementos);

// 5. HASH MAPS
console.log("\n=== HASH MAPS ===");

class HashMap {
    constructor() {
        this.mapa = {};
    }

    put(clave, valor) {
        this.mapa[clave] = valor;
    }

    get(clave) {
        return this.mapa[clave];
    }

    remove(clave) {
        delete this.mapa[clave];
    }

    keys() {
        return Object.keys(this.mapa);
    }

    values() {
        return Object.values(this.mapa);
    }

    size() {
        return Object.keys(this.mapa).length;
    }
}

// Ejemplo de uso
let hashMap = new HashMap();
hashMap.put("nombre", "Juan");
hashMap.put("edad", 25);
hashMap.put("ciudad", "Madrid");

console.log("HashMap:", hashMap.mapa);
console.log("Obtener 'nombre':", hashMap.get("nombre"));
console.log("Claves:", hashMap.keys());
console.log("Valores:", hashMap.values());

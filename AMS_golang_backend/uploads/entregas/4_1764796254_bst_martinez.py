# TP Árbol Binario de Búsqueda - Ana Martínez
class Nodo:
    def __init__(self, dato):
        self.dato = dato
        self.izquierdo = None
        self.derecho = None

class ArbolBinarioBusqueda:
    def __init__(self):
        self.raiz = None
    
    def insertar(self, dato):
        if self.raiz is None:
            self.raiz = Nodo(dato)
        else:
            self._insertar_recursivo(self.raiz, dato)
    
    def _insertar_recursivo(self, nodo, dato):
        if dato < nodo.dato:
            if nodo.izquierdo is None:
                nodo.izquierdo = Nodo(dato)
            else:
                self._insertar_recursivo(nodo.izquierdo, dato)
        elif dato > nodo.dato:
            if nodo.derecho is None:
                nodo.derecho = Nodo(dato)
            else:
                self._insertar_recursivo(nodo.derecho, dato)
    
    def buscar(self, dato):
        return self._buscar_recursivo(self.raiz, dato)
    
    def _buscar_recursivo(self, nodo, dato):
        if nodo is None or nodo.dato == dato:
            return nodo is not None
        
        if dato < nodo.dato:
            return self._buscar_recursivo(nodo.izquierdo, dato)
        else:
            return self._buscar_recursivo(nodo.derecho, dato)
    
    def eliminar(self, dato):
        self.raiz = self._eliminar_recursivo(self.raiz, dato)
    
    def _eliminar_recursivo(self, nodo, dato):
        if nodo is None:
            return nodo
        
        if dato < nodo.dato:
            nodo.izquierdo = self._eliminar_recursivo(nodo.izquierdo, dato)
        elif dato > nodo.dato:
            nodo.derecho = self._eliminar_recursivo(nodo.derecho, dato)
        else:
            # Nodo a eliminar encontrado
            if nodo.izquierdo is None:
                return nodo.derecho
            elif nodo.derecho is None:
                return nodo.izquierdo
            
            # Nodo con dos hijos
            nodo.dato = self._encontrar_minimo(nodo.derecho)
            nodo.derecho = self._eliminar_recursivo(nodo.derecho, nodo.dato)
        
        return nodo
    
    def _encontrar_minimo(self, nodo):
        while nodo.izquierdo is not None:
            nodo = nodo.izquierdo
        return nodo.dato
    
    def recorrido_inorden(self):
        resultado = []
        self._inorden_recursivo(self.raiz, resultado)
        return resultado
    
    def _inorden_recursivo(self, nodo, resultado):
        if nodo:
            self._inorden_recursivo(nodo.izquierdo, resultado)
            resultado.append(nodo.dato)
            self._inorden_recursivo(nodo.derecho, resultado)
    
    def altura(self):
        return self._altura_recursiva(self.raiz)
    
    def _altura_recursiva(self, nodo):
        if nodo is None:
            return 0
        return 1 + max(self._altura_recursiva(nodo.izquierdo), 
                      self._altura_recursiva(nodo.derecho))

if __name__ == "__main__":
    # Pruebas del árbol
    arbol = ArbolBinarioBusqueda()
    
    # Insertar elementos
    elementos = [50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45]
    for elemento in elementos:
        arbol.insertar(elemento)
    
    print("Árbol en orden:", arbol.recorrido_inorden())
    print("Altura del árbol:", arbol.altura())
    
    # Buscar elementos
    print("Buscar 40:", arbol.buscar(40))
    print("Buscar 100:", arbol.buscar(100))
    
    # Eliminar elemento
    arbol.eliminar(30)
    print("Después de eliminar 30:", arbol.recorrido_inorden())

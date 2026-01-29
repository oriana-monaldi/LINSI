// TP Árbol Binario de Búsqueda - Carlos López
class NodoArbol {
    int dato;
    NodoArbol izquierdo;
    NodoArbol derecho;
    
    public NodoArbol(int dato) {
        this.dato = dato;
        this.izquierdo = null;
        this.derecho = null;
    }
}

public class ArbolBinarioBusqueda {
    private NodoArbol raiz;
    
    public ArbolBinarioBusqueda() {
        this.raiz = null;
    }
    
    public void insertar(int dato) {
        raiz = insertarRecursivo(raiz, dato);
    }
    
    private NodoArbol insertarRecursivo(NodoArbol nodo, int dato) {
        if (nodo == null) {
            return new NodoArbol(dato);
        }
        
        if (dato < nodo.dato) {
            nodo.izquierdo = insertarRecursivo(nodo.izquierdo, dato);
        } else if (dato > nodo.dato) {
            nodo.derecho = insertarRecursivo(nodo.derecho, dato);
        }
        
        return nodo;
    }
    
    public boolean buscar(int dato) {
        return buscarRecursivo(raiz, dato);
    }
    
    private boolean buscarRecursivo(NodoArbol nodo, int dato) {
        if (nodo == null) {
            return false;
        }
        
        if (dato == nodo.dato) {
            return true;
        }
        
        if (dato < nodo.dato) {
            return buscarRecursivo(nodo.izquierdo, dato);
        } else {
            return buscarRecursivo(nodo.derecho, dato);
        }
    }
    
    public void eliminar(int dato) {
        raiz = eliminarRecursivo(raiz, dato);
    }
    
    private NodoArbol eliminarRecursivo(NodoArbol nodo, int dato) {
        if (nodo == null) {
            return null;
        }
        
        if (dato < nodo.dato) {
            nodo.izquierdo = eliminarRecursivo(nodo.izquierdo, dato);
        } else if (dato > nodo.dato) {
            nodo.derecho = eliminarRecursivo(nodo.derecho, dato);
        } else {
            // Nodo a eliminar encontrado
            if (nodo.izquierdo == null) {
                return nodo.derecho;
            } else if (nodo.derecho == null) {
                return nodo.izquierdo;
            }
            
            nodo.dato = encontrarMinimo(nodo.derecho);
            nodo.derecho = eliminarRecursivo(nodo.derecho, nodo.dato);
        }
        
        return nodo;
    }
    
    private int encontrarMinimo(NodoArbol nodo) {
        int minimo = nodo.dato;
        while (nodo.izquierdo != null) {
            minimo = nodo.izquierdo.dato;
            nodo = nodo.izquierdo;
        }
        return minimo;
    }
    
    public void imprimirEnOrden() {
        imprimirEnOrdenRecursivo(raiz);
        System.out.println();
    }
    
    private void imprimirEnOrdenRecursivo(NodoArbol nodo) {
        if (nodo != null) {
            imprimirEnOrdenRecursivo(nodo.izquierdo);
            System.out.print(nodo.dato + " ");
            imprimirEnOrdenRecursivo(nodo.derecho);
        }
    }
    
    public static void main(String[] args) {
        ArbolBinarioBusqueda arbol = new ArbolBinarioBusqueda();
        
        // Insertar elementos
        int[] valores = {50, 30, 70, 20, 40, 60, 80};
        for (int valor : valores) {
            arbol.insertar(valor);
        }
        
        System.out.println("Árbol en orden:");
        arbol.imprimirEnOrden();
        
        // Buscar elementos
        System.out.println("Buscar 40: " + arbol.buscar(40));
        System.out.println("Buscar 25: " + arbol.buscar(25));
        
        // Eliminar elemento
        arbol.eliminar(30);
        System.out.println("Después de eliminar 30:");
        arbol.imprimirEnOrden();
    }
}

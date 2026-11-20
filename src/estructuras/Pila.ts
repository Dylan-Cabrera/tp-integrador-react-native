/** Pila LIFO: el último elemento apilado es el primero en salir. */
export class Pila<T> {
  #items: T[];

  constructor(items: readonly T[] = []) {
    this.#items = [...items];
  }

  apilar(item: T): void {
    this.#items.push(item);
  }

  desapilar(): T | undefined {
    return this.#items.pop();
  }

  tope(): T | undefined {
    return this.#items[this.#items.length - 1];
  }

  estaVacia(): boolean {
    return this.#items.length === 0;
  }

  get tamanio(): number {
    return this.#items.length;
  }

  /** Copia de los elementos, de la base al tope. */
  aArray(): T[] {
    return [...this.#items];
  }

  /** Pila nueva con los mismos elementos, para no mutar la que está en el estado de React. */
  clonar(): Pila<T> {
    return new Pila(this.#items);
  }
}

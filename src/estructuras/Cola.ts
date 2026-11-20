/**
 * Cola FIFO: el primero en entrar es el primero en salir.
 * No usa `shift()` (que es O(n)): avanza un índice de inicio y compacta cuando sobra espacio.
 */
export class Cola<T> {
  #items: T[];
  #inicio = 0;

  constructor(items: readonly T[] = []) {
    this.#items = [...items];
  }

  encolar(item: T): void {
    this.#items.push(item);
  }

  desencolar(): T | undefined {
    if (this.estaVacia()) {
      return undefined;
    }
    const item = this.#items[this.#inicio];
    this.#inicio += 1;
    if (this.#inicio * 2 >= this.#items.length) {
      this.#items = this.#items.slice(this.#inicio);
      this.#inicio = 0;
    }
    return item;
  }

  frente(): T | undefined {
    return this.estaVacia() ? undefined : this.#items[this.#inicio];
  }

  estaVacia(): boolean {
    return this.tamanio === 0;
  }

  get tamanio(): number {
    return this.#items.length - this.#inicio;
  }

  /** Copia de los elementos, del frente al final. */
  aArray(): T[] {
    return this.#items.slice(this.#inicio);
  }

  /** Cola nueva con los mismos elementos, para no mutar la que está en el estado de React. */
  clonar(): Cola<T> {
    return new Cola(this.aArray());
  }
}

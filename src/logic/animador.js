export const EASINGS = Object.freeze({
  linear: (t) => t,
  entrada: (t) => t * t,
  saida: (t) => 1 - (1 - t) * (1 - t),
  suave: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
});

export class Animador {
  constructor() {
    this.ativas = [];
  }

  animar({ duracao, de = 0, para = 1, easing = 'linear', aoAtualizar = () => {} }) {
    return new Promise((resolve) => {
      this.ativas.push({ duracao, de, para, easing: EASINGS[easing] ?? EASINGS.linear, aoAtualizar, resolve, inicio: null });
    });
  }

  esperar(duracao) {
    return this.animar({ duracao });
  }

  atualizar(agora) {
    if (this.ativas.length === 0) return;
    const restantes = [];
    for (const a of this.ativas) {
      if (a.inicio === null) a.inicio = agora;
      const t = a.duracao > 0 ? Math.min(1, (agora - a.inicio) / a.duracao) : 1;
      a.aoAtualizar(a.de + (a.para - a.de) * a.easing(t), t);
      if (t >= 1) a.resolve(true);
      else restantes.push(a);
    }
    this.ativas = restantes;
  }

  parar() {
    for (const a of this.ativas) a.resolve(false);
    this.ativas = [];
  }

  get ocupado() {
    return this.ativas.length > 0;
  }
}

// Posição da cabeça do jogador no mundo.
// No Quest, vem do rastreamento do óculos; no computador, da câmera movida por WASD.

/** Escreve em `alvo` (THREE.Vector3) a posição da cabeça e devolve `alvo`. */
export function posicaoCabeca(sceneEl, alvo) {
  const camera = sceneEl.camera;
  if (!camera) return alvo.set(0, 0, 0);
  return camera.getWorldPosition(alvo);
}

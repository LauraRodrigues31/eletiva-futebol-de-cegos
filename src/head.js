export function posicaoCabeca(sceneEl, alvo) {
  const camera = sceneEl.camera;
  if (!camera) return alvo.set(0, 0, 0);
  return camera.getWorldPosition(alvo);
}

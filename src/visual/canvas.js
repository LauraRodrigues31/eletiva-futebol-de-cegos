const FONTE = 'system-ui, "Segoe UI", Roboto, Arial, sans-serif';

function criarCanvas(largura, altura) {
  const canvas = document.createElement('canvas');
  canvas.width = largura;
  canvas.height = altura;
  return { canvas, ctx: canvas.getContext('2d') };
}

function paraTextura(canvas, { repetir = null } = {}) {
  const textura = new THREE.CanvasTexture(canvas);
  textura.colorSpace = THREE.SRGBColorSpace;
  textura.anisotropy = 4;
  if (repetir) {
    textura.wrapS = textura.wrapT = THREE.RepeatWrapping;
    textura.repeat.set(repetir.x, repetir.y);
  }
  return textura;
}

function retanguloArredondado(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function quebrarLinhas(ctx, texto, larguraMax) {
  const linhas = [];
  for (const paragrafo of String(texto).split('\n')) {
    let atual = '';
    for (const palavra of paragrafo.split(' ')) {
      const tentativa = atual ? `${atual} ${palavra}` : palavra;
      if (ctx.measureText(tentativa).width > larguraMax && atual) {
        linhas.push(atual);
        atual = palavra;
      } else {
        atual = tentativa;
      }
    }
    linhas.push(atual);
  }
  return linhas;
}

export function desenharTexto(
  canvasInfo,
  { texto, tamanhoFonte = 48, cor = '#ffffff', fundo = null, opacidadeFundo = 0.75, peso = 600, margem = 40 },
) {
  const { canvas, ctx } = canvasInfo;
  const { width: w, height: h } = canvas;
  ctx.clearRect(0, 0, w, h);

  if (fundo) {
    ctx.globalAlpha = opacidadeFundo;
    ctx.fillStyle = fundo;
    retanguloArredondado(ctx, 0, 0, w, h, Math.min(w, h) * 0.12);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  ctx.font = `${peso} ${tamanhoFonte}px ${FONTE}`;
  ctx.fillStyle = cor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const linhas = quebrarLinhas(ctx, texto, w - margem * 2);
  const entrelinha = tamanhoFonte * 1.3;
  const topo = h / 2 - ((linhas.length - 1) * entrelinha) / 2;
  linhas.forEach((linha, i) => ctx.fillText(linha, w / 2, topo + i * entrelinha));
}

export function texturaTexto(largura, altura, opcoes) {
  const info = criarCanvas(largura, altura);
  desenharTexto(info, opcoes);
  return { ...info, textura: paraTextura(info.canvas) };
}

export function texturaCamisa({ numero, nome = '', cor = '#f2c230', corNumero = '#1f6b3a' }) {
  const { canvas, ctx } = criarCanvas(512, 512);

  ctx.beginPath();
  ctx.moveTo(196, 40);
  ctx.quadraticCurveTo(256, 70, 316, 40);
  ctx.lineTo(420, 80);
  ctx.lineTo(500, 190);
  ctx.lineTo(430, 240);
  ctx.lineTo(392, 190);
  ctx.lineTo(392, 490);
  ctx.lineTo(120, 490);
  ctx.lineTo(120, 190);
  ctx.lineTo(82, 240);
  ctx.lineTo(12, 190);
  ctx.lineTo(92, 80);
  ctx.closePath();
  ctx.fillStyle = cor;
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.stroke();

  ctx.strokeStyle = corNumero;
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(30, 200);
  ctx.lineTo(90, 245);
  ctx.moveTo(482, 200);
  ctx.lineTo(422, 245);
  ctx.stroke();
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(196, 44);
  ctx.quadraticCurveTo(256, 74, 316, 44);
  ctx.stroke();

  ctx.fillStyle = corNumero;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (nome) {
    ctx.font = `800 48px ${FONTE}`;
    ctx.fillText(nome, 256, 140);
  }
  ctx.font = `900 210px ${FONTE}`;
  ctx.fillText(String(numero), 256, 320);

  return paraTextura(canvas);
}

export function texturaLadrilho({ cor = '#8d949c', corJunta = '#6f757c', repetir = { x: 1, y: 1 } } = {}) {
  const { canvas, ctx } = criarCanvas(256, 256);
  ctx.fillStyle = corJunta;
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = cor;
  for (const [x, y] of [[0, 0], [128, 0], [0, 128], [128, 128]]) {
    ctx.fillRect(x + 3, y + 3, 122, 122);
  }
  return paraTextura(canvas, { repetir });
}

export function texturaQuadroTatico() {
  const { canvas, ctx } = criarCanvas(1024, 512);
  ctx.fillStyle = '#f4f4f0';
  ctx.fillRect(0, 0, 1024, 512);
  ctx.fillStyle = '#2f6b3f';
  ctx.fillRect(60, 50, 904, 412);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 6;
  ctx.strokeRect(80, 70, 864, 372);
  ctx.beginPath();
  ctx.moveTo(512, 70);
  ctx.lineTo(512, 442);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(512, 256, 60, 0, Math.PI * 2);
  ctx.stroke();
  for (const x of [80, 944]) {
    const dir = x === 80 ? 1 : -1;
    ctx.beginPath();
    ctx.arc(x, 256, 110, -Math.PI / 2, Math.PI / 2, dir < 0);
    ctx.stroke();
  }
  ctx.lineWidth = 7;
  ctx.font = `800 52px ${FONTE}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffd21f';
  for (const [x, y] of [[300, 160], [300, 350], [420, 256], [620, 200]]) ctx.fillText('X', x, y);
  ctx.fillStyle = '#ff6b6b';
  for (const [x, y] of [[700, 300], [760, 180], [840, 256]]) ctx.fillText('O', x, y);
  ctx.strokeStyle = '#ffd21f';
  ctx.setLineDash([16, 12]);
  ctx.beginPath();
  ctx.moveTo(430, 256);
  ctx.quadraticCurveTo(560, 330, 880, 256);
  ctx.stroke();
  return paraTextura(canvas);
}

export function texturaFaixa() {
  const { canvas, ctx } = criarCanvas(256, 512);
  const borda = ctx.createLinearGradient(0, 0, 0, 512);
  borda.addColorStop(0, 'rgba(8,8,8,1)');
  borda.addColorStop(0.78, 'rgba(8,8,8,1)');
  borda.addColorStop(1, 'rgba(8,8,8,0)');
  ctx.fillStyle = borda;
  ctx.fillRect(0, 0, 256, 512);

  ctx.globalCompositeOperation = 'source-atop';
  ctx.fillStyle = 'rgba(60,60,60,0.35)';
  for (let y = 0; y < 512; y += 6) ctx.fillRect(0, y, 256, 2);
  return paraTextura(canvas);
}

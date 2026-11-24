// Ponto de entrada: importa e registra os systems e componentes do jogo.
// O A-Frame só inicializa as entidades quando o documento termina de carregar,
// então tudo o que for registrado aqui já vale para a cena do index.html.
import './systems/game-state.js';
import './components/field-placeholder.js';
import './components/play-area.js';
import './components/ball.js';
import './components/kicker.js';
import './components/goal-zones.js';
import './components/debug-hud.js';

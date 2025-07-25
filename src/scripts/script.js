import Interface from './interface.js';
import { SinglePlayerGame } from './game.js';

const TASK_NUMBER = Number(window.location.pathname.split('/').pop()[6]);

if (TASK_NUMBER <= 4) {
    const game = new SinglePlayerGame(TASK_NUMBER);
    game.generateTemplate();
    Interface.addEventListeners(game.play, game.generateTemplate, game.changeTeam);
}
else {
    const game = null;
}
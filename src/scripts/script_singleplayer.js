import { SingleplayerGame } from './game.js';

const task_number = Number(window.location.pathname.split('/').pop()[4]);
const game = new SingleplayerGame(task_number);
game.generateTemplate();
game.interface.addEventListeners(game.play, game.generateTemplate, game.changeTeam);
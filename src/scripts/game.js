import Interface from './interface.js';
import Assets from './assets.js';
import getTemplate from './templates.js';
import { Entity, Player } from './entities.js';

export class SinglePlayerGame {
    constructor() {
        this.canvas = document.getElementById('main-content-game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.background = new Entity(`${Assets.path}/background.png`, 0, 0, this.canvas.width, this.canvas.height);
        this.canvas_positions = {
            x: [42, 122, 206, 288, 370],
            y: [36, 103, 172, 240, 310, 378, 447, 515]
        };
        this.player_list = [];
        this.position_grid = undefined;
    }

    /**
     * Desenha as entidades no canvas.
     */
    drawEntities() {
        this.background.draw(this.ctx);
        for (const player of this.player_list) {
            player.draw(this.ctx);
        }
    }

    /**
     * Mantém as entidades desenhadas enquanto o jogo não é iniciado.
     */
    standBy = () => {
        this.drawEntities();
        requestAnimationFrame(this.standBy);
    }

    /**
     * Inicia o jogo.
     */
    play = () => {
        this.drawEntities();
        requestAnimationFrame(this.play);
    }

    /**
     * Gera um template aleatório para o jogo.
     */
    generateTemplate(task_number) {
        this.position_grid = getTemplate(task_number);
        this.createPlayers();
    }

    /**
     * Adiciona os jogadores à lista de jogadores da classe.
     */
    createPlayers() {
        for (let i = 0; i < this.position_grid.length; i++) {
            for (let j = 0; j < this.position_grid[0].length; j++) {
                continue;
            }
        }
    }
}
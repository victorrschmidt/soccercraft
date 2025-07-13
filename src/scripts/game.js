import Configs from './configs.js';
import Interface from './interface.js';
import Template from './template.js';
import { Entity } from './entities.js';

export class SinglePlayerGame {
    constructor(task_number) {
        this.task_number = task_number;
        this.canvas = document.getElementById(Configs.html.main_content_game_screen_canvas);
        this.ctx = this.canvas.getContext('2d');
        this.background = new Entity(`${Configs.assets.path}/${Configs.assets.background_file_name}`, 0, 0, this.canvas.width, this.canvas.height);
        this.template = new Template(task_number);
        this.moveset = undefined;
    }

    /**
     * Pega a lista de movimentos da interface atual.
     */
    getMoveset() {
        this.moveset = Interface.getMoveList();
    }

    /**
     * Gera um template (configuração de posição dos jogadores) para o jogo.
     */
    generateTemplate = () => {
        this.template.generateNewTemplate();
        Interface.deleteAllMoves();
    }

    /**
     * Muda o time que o aluno está controlando.
     */
    changeTeam = () => {
        this.template.changeTeam();
    }

    /**
     * Desenha as entidades no canvas.
     */
    drawEntities() {
        this.background.draw(this.ctx);
        for (const player of this.template.player_list) {
            player.draw(this.ctx);
        }
    }
}
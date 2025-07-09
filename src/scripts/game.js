import Configs from './configs.js';
import Interface from './interface.js';
import Entity from './entity.js';
import Template from './templates.js';

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
     * Desenha as entidades no canvas.
     */
    drawEntities() {
        this.background.draw(this.ctx);
        for (const player of this.template.player_list) {
            player.draw(this.ctx);
        }
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
        this.template.generateTemplate();
        Interface.deleteAllMoves();
    }

    /**
     * Muda o time que o aluno está controlando.
     */
    changeTeam = () => {
        this.template.changeTeam();
    }

    standBy = () => {
        this.drawEntities();
        requestAnimationFrame(this.standBy);
    }

    /**
     * Inicia o jogo.
     */
    play = () => {
        if (Interface.getMoveAmount() === 0) {
            alert('A lista deve conter ao menos um comando!');
            return;
        }
        this.getMoveset();
        this.player_info.setPlayers();
        let i = 0;
        const step = () => {
            const move = this.moveset[i];
            if (!this.player_info.processMove(move)) {
                alert('comando impossível.');
                this.player_info.copyGrid();
                this.player_info.setPlayers();
                return;
            }
            this.drawEntities();
            if (++i < this.moveset.length) {
                setTimeout(step, Configs.game.delay);
            }
        };

        step();
    };
}
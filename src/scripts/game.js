import Configs from './configs.js';
import Interface from './interface.js';
import Template from './template.js';
import Move from './move.js';
import { Entity } from './entities.js';

export class SinglePlayerGame {
    constructor(task_number) {
        this.task_number = task_number;
        this.canvas = document.getElementById(Configs.html.game_canvas);
        this.ctx = this.canvas.getContext('2d');
        this.background = new Entity(`${Configs.assets.path}/${Configs.assets.background_file_name}`, 0, 0, this.canvas.width, this.canvas.height);
        this.background.image.onload = this.checkLoadedImages;
        this.template = new Template(task_number);
        this.template.ball.image.onload = this.checkLoadedImages;
        this.had_invalid_move = undefined;
        this.has_scored = undefined;
        this.is_making_move = undefined;
        this.moveset = undefined;
        this.current_move_id = undefined;
        this.target_position = {x: undefined, y: undefined};
        this.loaded_images = undefined;
        this.total_images = undefined;
    }

    loadImages() {
        this.loaded_images = Number(this.background.image.complete) + Number(this.template.ball.image.complete);
        this.total_images = this.template.player_list.length + 2;
        for (const player of this.template.player_list) {
            player.image.onload = this.checkLoadedImages;
        }
    }

    checkLoadedImages = () => {
        this.loaded_images++;
        if (this.loaded_images === this.total_images) {
            this.drawEntities();
        }
    }

    drawEntities() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.background.draw(this.ctx);
        this.template.ball.draw(this.ctx);
        for (const player of this.template.player_list) {
            player.draw(this.ctx);
        }
    }

    setTargetPosition() {
        if (this.current_move_id === this.moveset.length) return;
        const move = this.moveset[this.current_move_id];
        if (!Move.isValidMove(this.template, move)) {
            this.had_invalid_move = true;
            return;
        }
        this.is_making_move = true;
        let y = this.template.main_player_position.y;
        let x = this.template.main_player_position.x;
        let ny = y + Move.position_difference[move].y;
        let nx = x + Move.position_difference[move].x;
        this.target_position.y = this.template.canvas_positions.y[ny];
        this.target_position.x = this.template.canvas_positions.x[nx];
        this.template.main_player_position.y = ny;
        this.template.main_player_position.x = nx;
        this.template.player_ptr_grid[y][x] = -1;
        this.template.player_ptr_grid[ny][nx] = 0;
    }

    finishedMove() {
        return this.template.player_list[0].x === this.target_position.x && this.template.player_list[0].y === this.target_position.y;
    }

    makeMove() {
        const move = this.moveset[this.current_move_id];
        Move.makeMove(this.template, move);
    }

    tryGoal(move) {
        if (Move.isValidMove(this.template, move)) {
            this.has_scored = true;
        }
    }

    run = () => {
        if (this.is_making_move && !this.finishedMove()) {
            this.makeMove();
        }
        else {
            this.current_move_id++;
            if (this.current_move_id === this.moveset.length) {
                this.endGame('no_goal');
                return;
            }
            const move = this.moveset[this.current_move_id];
            if (!move.startsWith('goal_kick')) {
                this.setTargetPosition();
            }
            else {
                this.tryGoal(move);
            }
            if (this.had_invalid_move) {
                this.endGame('invalid_move');
                return;
            }
        }
        this.drawEntities();
        if (this.has_scored) {
            this.endGame('goal');
            return;
        }
        requestAnimationFrame(this.run);
    }

    getMoveset() {
        this.moveset = Interface.getMoveList();
    }

    generateTemplate = () => {
        this.template.generateNewTemplate();
        this.loadImages();
        Interface.deleteAllMoves();
    }

    endGame(reason) {
        switch (reason) {
            case 'goal':
                alert('GOOOL!!! Você venceu!');
                this.generateTemplate();
                break;
            case 'invalid_move':
                alert('Você perdeu. Seu jogador fez um movimento inválido.');
                this.resetTemplate();
                break;
            case 'no_goal':
                alert('Você perdeu. Seu jogador não marcou o gol.');
                this.resetTemplate();
                break;
        }
    }

    resetTemplate = () => {
        Interface.deleteAllMoves();
        this.template.resetCurrentTemplate();
        this.drawEntities();
    }

    changeTeam = () => {
        this.template.changeTeam();
        this.loadImages();
    }

    play = () => {
        this.getMoveset();
        this.current_move_id = 0;
        this.had_invalid_move = false;
        this.has_scored = false;
        this.setTargetPosition();
        if (this.had_invalid_move) {
            this.endGame('invalid_move');
            return;
        }
        this.is_making_move = true;
        this.run();

    }
}
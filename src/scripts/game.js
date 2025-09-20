import Configs from './configs.js';
import Interface from './interface.js';
import Move from './move.js';
import { MultiplayerTemplate, SingleplayerTemplate } from './template.js';
import { Entity } from './entities.js';

class Game {
    constructor() {
        this.canvas = document.getElementById(Configs.html.game_canvas);
        this.ctx = this.canvas.getContext('2d');
        this.background = new Entity(`${Configs.assets.path}/${Configs.assets.background_file_name}`, 0, 0, this.canvas.width, this.canvas.height);
        this.background.image.onload = this.checkLoadedImages;
        this.interface = new Interface();
        this.had_invalid_move = undefined;
        this.goalkeeper_defended = undefined;
        this.has_scored = undefined;
        this.is_making_move = undefined;
        this.moveset = undefined;
    }

    checkLoadedImages = () => {
        this.loaded_images++;
        if (this.loaded_images === this.total_images) {
            this.drawEntities();
        }
    }
}

export class SingleplayerGame extends Game {
    constructor(task_number) {
        super();
        this.task_number = task_number;
        this.template = new SingleplayerTemplate(task_number);
        this.template.ball.image.onload = this.checkLoadedImages;
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
        if (move.startsWith('player_move')) {
            this.target_position.y = this.template.canvas_positions.y[ny];
            this.target_position.x = this.template.canvas_positions.x[nx];
            this.template.player_ptr_grid[y][x] = -1;
            this.template.player_ptr_grid[ny][nx] = 0;
        }
        else {
            if (move === 'ball_pass_up') {
                while (this.template.player_ptr_grid[ny][x] === -1) ny--;
            }
            else if (move === 'ball_pass_right') {
                while (this.template.player_ptr_grid[y][nx] === -1) nx++;
            }
            else if (move === 'ball_pass_down') {
                while (this.template.player_ptr_grid[ny][x] === -1) ny++;
            }
            else {
                while (this.template.player_ptr_grid[y][nx] === -1) nx--;
            }
            let ptr = this.template.player_ptr_grid[ny][nx];
            [this.template.player_list[0], this.template.player_list[ptr]] = [this.template.player_list[ptr], this.template.player_list[0]];
            [this.template.player_ptr_grid[y][x], this.template.player_ptr_grid[ny][nx]] = [this.template.player_ptr_grid[ny][nx], this.template.player_ptr_grid[y][x]];
            this.target_position.y = this.template.canvas_positions.y[ny] + this.template.canvas_ball_diff.y;
            this.target_position.x = this.template.canvas_positions.x[nx] + this.template.canvas_ball_diff.x;
        }
        this.template.main_player_position.y = ny;
        this.template.main_player_position.x = nx;
    }

    finishedMove(move) {
        if (move.startsWith('player_move')) return this.template.player_list[0].x === this.target_position.x && this.template.player_list[0].y === this.target_position.y;
        return this.template.ball.x === this.target_position.x && this.template.ball.y === this.target_position.y;
    }

    makeMove() {
        const move = this.moveset[this.current_move_id];
        Move.makeMove(this.template, move);
    }

    tryGoal(move) {
        if (Move.isValidMove(this.template, move)) {
            this.has_scored = true;
        }
        else {
            if (!Move.playerIsAtGoalPosition(this.template, this.template.main_player_position.x, this.template.main_player_position.y)) {
                this.had_invalid_move = true;
            }
            else {
                this.goalkeeper_defended = true;
            }
        }
    }

    run = () => {
        if (this.is_making_move && !this.finishedMove(this.moveset[this.current_move_id])) {
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
                if (this.goalkeeper_defended) {
                    this.endGame('goalkeeper_defended');
                    return;
                }
                else if (this.had_invalid_move) {
                    this.endGame('invalid_move');
                    return;
                }
                else {
                    this.endGame('goal');
                    return;
                }
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
        this.moveset = this.interface.getMoveList();
    }

    generateTemplate = () => {
        this.template.generateNewTemplate();
        this.loadImages();
        this.interface.deleteAllMoves();
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
            case 'goalkeeper_defended':
                alert('Você perdeu. O goleiro defendeu a finzalização.');
                this.resetTemplate();
                break;
        }
    }

    resetTemplate = () => {
        this.interface.deleteAllMoves();
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
        this.goalkeeper_defended = false;
        this.setTargetPosition();
        if (this.had_invalid_move) {
            this.endGame('invalid_move');
            return;
        }
        this.is_making_move = true;
        this.run();
    }
}





























































export class MultiplayerGame extends Game {
    constructor() {
        super();
        this.loaded_images = 0;
        this.template = new MultiplayerTemplate();
        this.template.blue_ball.image.onload = this.checkLoadedImages;
        this.template.red_ball.image.onload = this.checkLoadedImages;
        this.template.addGoalkeeper('blue');
        this.template.addGoalkeeper('red');
        this.moveset = [];
        this.template.player_list[0].image.onload = this.checkLoadedImages;
        this.template.player_list[1].image.onload = this.checkLoadedImages;
        this.total_images = 17;
        this.selection_canvas = document.getElementById(Configs.html.selection_canvas);
        this.restart_button = document.getElementById(Configs.html.restart_button);
        this.turn_color = document.getElementById('main-content-game-select-turn-color');
        this.turn_color_codes = ['#0047AB', '#D22B2B'];
        this.used_cells = new Set();
        this.teams = ['blue', 'red'];
        this.target_position = {x: undefined, y: undefined};
        this.teams_portuguese = ['Azul', 'Vermelho'];
        this.player_interface = document.getElementById('main-content-game-select');
        this.player_interface_boxes = document.getElementsByClassName('main-content-game-select-player');
        this.team_ptr = 0;
        this.player_count = 2;
        this.game_controls = document.getElementById('main-content-game-controls');
        this.game_controls.style.display = 'none';
    }

    drawEntities() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.background.draw(this.ctx);
        this.template.red_ball.draw(this.ctx);
        this.template.blue_ball.draw(this.ctx);
        for (const player of this.template.player_list) {
            player.draw(this.ctx);
        }
    }

    createSelectionCell(x, y) {
        const element = document.createElement('div');
        element.id = `${x}${y}`;
        element.className = 'selection-canvas-cell image-div';
        element.addEventListener('click', () => { this.addPlayerToCell(element.id) });
        return element;
    }

    addSelectionCells() {
        for (let i = 0; i < Configs.game.field_rows; i++) {
            for (let j = 0; j < Configs.game.field_cols; j++) {
                const element = this.createSelectionCell(i, j);
                this.selection_canvas.appendChild(element);
            }
        }
    }

    addPlayerToCell(id) {
        if (this.used_cells.has(id)) {
            return;
        }
        const x = Number(id[0]);
        const y = Number(id[1]);
        if (this.loaded_images === 5) {
            this.template.main_blue_player.x = y;
            this.template.main_blue_player.y = x;
        }
        else if (this.loaded_images === 6) {
            this.template.main_red_player.x = y;
            this.template.main_red_player.y = x;
        }
        const cell = document.getElementById(id);
        const current_team = this.teams[this.team_ptr];
        cell.style.backgroundImage = `url('../assets/player_${current_team}_${this.template.team_info[current_team].asset_ptr + 1}.png')`;
        this.template.addToPlayerList(y, x, current_team);
        this.template.player_list[this.template.player_list.length - 1].image.onload = this.checkLoadedImages;
        this.template.player_ptr_grid[x][y] = this.player_count++;
        this.player_interface_boxes[this.team_ptr].removeChild(this.player_interface_boxes[this.team_ptr].firstChild);
        this.player_interface_boxes[this.team_ptr].removeChild(this.player_interface_boxes[this.team_ptr].firstChild);
        this.team_ptr ^= 1;
        this.turn_color.style.color = this.turn_color_codes[this.team_ptr];
        this.turn_color.innerHTML = this.teams_portuguese[this.team_ptr];
        this.used_cells.add(id);
        if (this.used_cells.size === 14) {
            this.setGame();
        }
    }

    addEventListeners() {
        this.used_cells.add('02');
        this.used_cells.add('72');
        this.addSelectionCells();
        this.restart_button.addEventListener('click', () => { window.location.reload(); });
    }

    setGame() {
        this.selection_canvas.style.display = 'none';
        this.player_interface.style.display = 'none';
        this.canvas.style.display = 'block';
        this.game_controls.style.display = 'block';
        this.template.defineBallPosition(this.template.main_blue_player.x, this.template.main_blue_player.y, this.template.main_red_player.x, this.template.main_red_player.y);
        this.interface.addEventListeners(this.play);
        this.game_controls.style.backgroundColor = this.turn_color_codes[0];
    }

    makeMove(move) {
        if (move.startsWith('player_move')) {
            this.template.player_list[this.team_ptr + 2].x += Move.position_difference[move].x;
            this.template.player_list[this.team_ptr + 2].y += Move.position_difference[move].y;
            if (this.team_ptr === 0) {
                this.template.blue_ball.x += Move.position_difference[move].x;
                this.template.blue_ball.y += Move.position_difference[move].y;
            }
            else {
                this.template.red_ball.x += Move.position_difference[move].x;
                this.template.red_ball.y += Move.position_difference[move].y;
            }
            return;
        }
        if (move.startsWith('ball_pass')) {
            if (this.team_ptr === 0) {
                this.template.blue_ball.x += Move.position_difference[move].x;
                this.template.blue_ball.y += Move.position_difference[move].y;
            }
            else {
                this.template.red_ball.x += Move.position_difference[move].x;
                this.template.red_ball.y += Move.position_difference[move].y;
            }
            return;
        }
        if (move.startsWith('goal_kick') && this.template.task_number <= 3) {
            return;
        }
    }

    isValidMove(move) {
        const player_color = this.teams[this.team_ptr];
        const grid = this.template.player_ptr_grid;
        const player_list = this.template.player_list;
        if (player_color === 'blue') {
            const y = this.template.main_blue_player.y;
            const x = this.template.main_blue_player.x;
            if (move === 'player_move_right' && (x === 4 || grid[y][x + 1] !== -1)) return false;
            if (move === 'player_move_left' && (x === 0 || grid[y][x - 1] !== -1)) return false;
            if (move === 'player_move_up' && (y === 0 || grid[y - 1][x] !== -1)) return false;
            if (move === 'player_move_down' && (y === 7 || grid[y + 1][x] !== -1)) return false;
            if (move === 'goal_kick_up' && !(y !== 7 && x !== 2)) return false;
            if (move === 'ball_pass_up') {
                for (let i = y - 1; i >= 0; i--) {
                    let ptr = grid[i][x];
                    if (ptr === -1) continue;
                    if (player_list[ptr].team === player_color) return true;
                    return false;
                }
                return false;
            }
            else if (move === 'ball_pass_right') {
                for (let i = x + 1; i < Configs.game.field_cols; i++) {
                    let ptr = grid[y][i];
                    if (ptr === -1) continue;
                    if (player_list[ptr].team === player_color) return true;
                    return false;
                }
                return false;
            }
            else if (move === 'ball_pass_down') {
                for (let i = y + 1; i < Configs.game.field_rows; i++) {
                    let ptr = grid[i][x];
                    if (ptr === -1) continue;
                    if (player_list[ptr].team === player_color) return true;
                    return false;
                }
                return false;
            }
            else if (move === 'ball_pass_left') {
                for (let i = x - 1; i >= 0; i--) {
                    let ptr = grid[y][i];
                    if (ptr === -1) continue;
                    if (player_list[ptr].team === player_color) return true;
                    return false;
                }
                return false;
            }
        }
        else {
            const y = this.template.main_red_player.y;
            const x = this.template.main_red_player.x;
            if (move === 'player_move_right' && (x === 4 || grid[y][x + 1] !== -1)) return false;
            if (move === 'player_move_left' && (x === 0 || grid[y][x - 1] !== -1)) return false;
            if (move === 'player_move_up' && (y === 0 || grid[y - 1][x] !== -1)) return false;
            if (move === 'player_move_down' && (y === 7 || grid[y + 1][x] !== -1)) return false;
            if (move === 'goal_kick_up' && !(y !== 0 && x !== 2)) return false;
            if (move === 'ball_pass_up') {
                for (let i = y - 1; i >= 0; i--) {
                    let ptr = grid[i][x];
                    if (ptr === -1) continue;
                    if (player_list[ptr].team === player_color) return true;
                    return false;
                }
                return false;
            }
            else if (move === 'ball_pass_right') {
                for (let i = x + 1; i < Configs.game.field_cols; i++) {
                    let ptr = grid[y][i];
                    if (ptr === -1) continue;
                    if (player_list[ptr].team === player_color) return true;
                    return false;
                }
                return false;
            }
            else if (move === 'ball_pass_down') {
                for (let i = y + 1; i < Configs.game.field_rows; i++) {
                    let ptr = grid[i][x];
                    if (ptr === -1) continue;
                    if (player_list[ptr].team === player_color) return true;
                    return false;
                }
                return false;
            }
            else if (move === 'ball_pass_left') {
                for (let i = x - 1; i >= 0; i--) {
                    let ptr = grid[y][i];
                    if (ptr === -1) continue;
                    if (player_list[ptr].team === player_color) return true;
                    return false;
                }
                return false;
            }
        }
        return true;
    }

    setTargetPosition() {
        const move = this.moveset[0];
        let y, x;
        if (this.teams[this.team_ptr] === 'blue') {
            y = this.template.main_blue_player.y;
            x = this.template.main_blue_player.x;
        }
        else {
            y = this.template.main_red_player.y;
            x = this.template.main_red_player.x;
        }
        let ny = y + Move.position_difference[move].y;
        let nx = x + Move.position_difference[move].x;
        if (move.startsWith('player_move')) {
            this.target_position.y = this.template.canvas_positions.y[ny];
            this.target_position.x = this.template.canvas_positions.x[nx];
            this.template.player_ptr_grid[y][x] = -1;
            this.template.player_ptr_grid[ny][nx] = 0;
        }
        else {
            if (move === 'ball_pass_up') {
                while (this.template.player_ptr_grid[ny][x] === -1) ny--;
            }
            else if (move === 'ball_pass_right') {
                while (this.template.player_ptr_grid[y][nx] === -1) nx++;
            }
            else if (move === 'ball_pass_down') {
                while (this.template.player_ptr_grid[ny][x] === -1) ny++;
            }
            else {
                while (this.template.player_ptr_grid[y][nx] === -1) nx--;
            }
            let ptr = this.template.player_ptr_grid[ny][nx];
            [this.template.player_list[this.team_ptr + 2], this.template.player_list[ptr]] = [this.template.player_list[ptr], this.template.player_list[this.team_ptr + 2]];
            [this.template.player_ptr_grid[y][x], this.template.player_ptr_grid[ny][nx]] = [this.template.player_ptr_grid[ny][nx], this.template.player_ptr_grid[y][x]];
            this.target_position.y = this.template.canvas_positions.y[ny] + this.template.canvas_ball_diff.y;
            this.target_position.x = this.template.canvas_positions.x[nx] + this.template.canvas_ball_diff.x;
        }
        if (this.teams[this.team_ptr] === 'blue') {
            this.template.main_blue_player.y = ny;
            this.template.main_blue_player.x = nx;
        }
        else {
            this.template.main_red_player.y = ny;
            this.template.main_red_player.x = nx;
        }
    }

    finishedMove(move) {
        if (move.startsWith('player_move')) return this.template.player_list[this.team_ptr + 2].x === this.target_position.x && this.template.player_list[this.team_ptr + 2].y === this.target_position.y;
        if (this.team_ptr === 0) {
            return this.template.blue_ball.x === this.target_position.x && this.template.blue_ball.y === this.target_position.y;
        }
        else {
            return this.template.red_ball.x === this.target_position.x && this.template.red_ball.y === this.target_position.y;
        }
    }

    tryGoal(move) {
        if (Move.isValidMove(this.template, move)) {
            this.has_scored = true;
        }
        else {
            if (!Move.playerIsAtGoalPosition(this.template, this.template.main_player_position.x, this.template.main_player_position.y)) {
                this.had_invalid_move = true;
            }
            else {
                this.goalkeeper_defended = true;
            }
        }
    }

    run = () => {
        while (this.is_making_move && !this.finishedMove(this.moveset[0])) {
            this.drawEntities();
            this.makeMove(this.moveset[0]);
        }
    }

    getMoveset() {
        this.moveset = this.interface.getMoveList();
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
            case 'goalkeeper_defended':
                alert('Você perdeu. O goleiro defendeu a finzalização.');
                this.resetTemplate();
                break;
        }
    }

    play = () => {
        this.getMoveset();
        const move = this.moveset[0];
        if (!this.isValidMove(move)) {
            alert('Movimento inválido. Tente novamente.');
            return;
        }
        if (move === 'goal_kick_up') {
            this.tryGoal();
        }
        else {
            this.is_making_move = true;
            this.setTargetPosition();
            this.run();
        }
        this.team_ptr ^= 1;
        this.game_controls.style.backgroundColor = this.turn_color_codes[this.team_ptr];
    }
}
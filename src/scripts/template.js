import Configs from './configs.js';
import Utilities from './utilities.js';
import { Entity, Player } from './entities.js';

export default class Template {
    constructor(task_number) {
        this.task_number = task_number;
        this.task = Configs.game.tasks[task_number];
        this.player_ptr_grid = undefined;
        this.player_ptr_grid_copy = undefined;
        this.player_list = undefined;
        this.rows = Configs.game.field_rows;
        this.cols = Configs.game.field_cols;
        this.used_rows = this.rows / (1 + Number(this.task.half_field));
        this.friend_team = 'blue';
        this.enemy_team = 'red';
        this.team_info = {'blue': {opposite_team: 'red', asset_ptr: 0}, 'red': {opposite_team: 'blue', asset_ptr: 0}};
        this.main_player_position = {x: undefined, y: undefined};
        this.goalkeeper_position = {x: Math.floor(this.cols / 2), y: 0};
        this.canvas_positions = {x: [42, 122, 206, 288, 370], y: [36, 103, 172, 240, 310, 378, 447, 515]};
        this.canvas_ball_diff = {x: 36, y: 48};
        this.ball = new Entity(`${Configs.assets.path}/${Configs.assets.ball_file_name}`, 0, 0, Configs.assets.ball_default_size.width, Configs.assets.ball_default_size.height);
        this.goalkeeper_canvas_positions = {x: [180, 206, 232], y: 5};
    }

    generateNewTemplate() {
        const canAddEnemy = (x, y) => {
            let queue = [[this.main_player_position.y, this.main_player_position.x]];
            let visited = Array.from({length: this.rows}, () => Array(this.cols).fill(false));
            visited[this.main_player_position.y][this.main_player_position.x] = true;
            this.player_ptr_grid_copy[y][x] = 1;
            while (queue.length) {
                let [i, j] = queue.pop();
                for (let k = 0; k < dy.length; k++) {
                    let _i = i + dy[k];
                    let _j = j + dx[k];
                    let check = 0 <= Math.min(_i, _j);
                    check &&= _i < this.rows;
                    check &&= _j < this.cols;
                    check &&= !visited[_i][_j];
                    check &&= this.player_ptr_grid_copy[_i][_j] === -1;
                    if (check) {
                        visited[_i][_j] = true;
                        queue.push([_i, _j]);
                    }
                }
            }
            this.player_ptr_grid_copy[y][x] = -1;
            return visited[this.goalkeeper_position.y][this.goalkeeper_position.x];
        }
        const addToPlayerList = (x, y, team) => {
            const src = `${Configs.assets.path}/player_${team}_${this.team_info[team].asset_ptr + 1}.png`;
            const width = Configs.assets.game_player_default_size.width;
            const height = Configs.assets.game_player_default_size.height;
            y = this.canvas_positions.y[y];
            x = this.canvas_positions.x[x];
            this.team_info[team].asset_ptr++;
            this.player_list.push(new Player(src, x, y, width, height, team));
        }
        this.player_ptr_grid = Array.from({length: this.rows}, () => Array(this.cols).fill(-1));
        this.player_ptr_grid_copy = Array.from({length: this.rows}, () => Array(this.cols).fill(-1));
        this.player_list = [];
        this.team_info['blue'].asset_ptr = 0;
        this.team_info['red'].asset_ptr = 0;
        let positions = [];
        for (let i = 0; i < this.used_rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (i !== this.goalkeeper_position.y || j !== this.goalkeeper_position.x) {
                    positions.push([i, j]);
                }
            }
        }
        const main_player_index = Utilities.randint(0, positions.length - 1);
        const main_player_row = positions[main_player_index][0];
        const main_player_col = positions[main_player_index][1];
        this.player_ptr_grid_copy[main_player_row][main_player_col] = 0;
        this.main_player_position.y = main_player_row;
        this.main_player_position.x = main_player_col;
        this.defineBallPosition(main_player_col, main_player_row);
        addToPlayerList(main_player_col, main_player_row, this.friend_team);
        positions.splice(main_player_index, 1);
        const dy = this.task_number === 1 ? [0, -1, 0] : [0, -1, 0, 1];
        const dx = this.task_number === 1 ? [-1, 0, 1] : [-1, 0, 1, 0];
        const player_count = [this.task.enemy_count, this.task.friend_count];
        let ptr = 1;
        for (let k = 0; k < 2; k++) {
            for (let i = 0; i < player_count[k]; i++, ptr++) {
                let available_positions = Array(positions.length).fill().map((x, i) => i);
                let index = Utilities.randint(0, available_positions.length - 1);
                let y = positions[available_positions[index]][0];
                let x = positions[available_positions[index]][1];
                while (!canAddEnemy(x, y)) {
                    available_positions.splice(index, 1);
                    index = Utilities.randint(0, available_positions.length - 1);
                    y = positions[available_positions[index]][0];
                    x = positions[available_positions[index]][1];
                }
                this.player_ptr_grid_copy[y][x] = ptr;
                addToPlayerList(x, y, k === 0 ? this.enemy_team : this.friend_team);
                positions.splice(available_positions[index], 1);
            }
        }
        this.goalkeeper_side = this.task.has_goalkeeper ? Utilities.randint(0, 2) : undefined;
        if (this.task.has_goalkeeper) {
            let team = this.enemy_team;
            let src = `${Configs.assets.path}/player_${team}_${this.team_info[team].asset_ptr + 1}.png`;
            let width = Configs.assets.game_player_default_size.width;
            let height = Configs.assets.game_player_default_size.height;
            let x = this.goalkeeper_canvas_positions.x[this.goalkeeper_side];
            let y = this.goalkeeper_canvas_positions.y;
            this.team_info[team].asset_ptr++;
            this.player_list.push(new Player(src, x, y, width, height, team));
        }
        this.copyGrids();
    }

    defineBallPosition(x, y) {
        this.ball.y = this.canvas_positions.y[y] + this.canvas_ball_diff.y;
        this.ball.x = this.canvas_positions.x[x] + this.canvas_ball_diff.x;
    }

    copyGrids() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                this.player_ptr_grid[i][j] = this.player_ptr_grid_copy[i][j];
            }
        }
    }

    reconfigurePlayerList(swap_teams = false) {
        if (swap_teams) {
            this.team_info['blue'].asset_ptr = 0;
            this.team_info['red'].asset_ptr = 0;
        }
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                let ptr = this.player_ptr_grid[i][j];
                if (ptr === -1) {
                    continue;
                }
                if (ptr === 0) {
                    this.main_player_position.y = i;
                    this.main_player_position.x = j;
                    this.defineBallPosition(j, i);
                }
                let y = this.canvas_positions.y[i];
                let x = this.canvas_positions.x[j];
                let width = Configs.assets.game_player_default_size.width;
                let height = Configs.assets.game_player_default_size.height;
                let team = this.player_list[ptr].team;
                let src = this.player_list[ptr].image.src;
                if (swap_teams) {
                    team = this.team_info[team].opposite_team;
                    src = `${Configs.assets.path}/player_${team}_${this.team_info[team].asset_ptr + 1}.png`;
                    this.team_info[team].asset_ptr++;
                }
                this.player_list[ptr] = new Player(src, x, y, width, height, team);
            }
        }
        if (swap_teams && this.task.has_goalkeeper) {
            let goalkeeper = this.player_list[this.player_list.length - 1];
            let team = this.team_info[goalkeeper.team].opposite_team;
            let src = `${Configs.assets.path}/player_${team}_${this.team_info[team].asset_ptr + 1}.png`;
            this.team_info[team].asset_ptr++;
            this.player_list[this.player_list.length - 1] = new Player(src, goalkeeper.x, goalkeeper.y, goalkeeper.width, goalkeeper.height, team);
        }
    }

    resetCurrentTemplate() {
        this.copyGrids();
        this.reconfigurePlayerList();
    }

    changeTeam() {
        [this.friend_team, this.enemy_team] = [this.enemy_team, this.friend_team];
        this.reconfigurePlayerList(true);
    }
}
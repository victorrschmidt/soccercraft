import Configs from './configs.js';

export default class Move {
    static position_difference = {
        'player_move_left': {x: -1, y: 0},
        'player_move_right': {x: 1, y: 0},
        'player_move_up': {x: 0, y: -1},
        'player_move_down': {x: 0, y: 1},
        'ball_pass_left': {x: -1, y: 0},
        'ball_pass_right': {x: 1, y: 0},
        'ball_pass_up': {x: 0, y: -1},
        'ball_pass_down': {x: 0, y: 1}
    };

    static isValidMove(template, move) {
        let y = template.main_player_position.y;
        let x = template.main_player_position.x;
        if (move.startsWith('player_move')) {
            y += Move.position_difference[move].y;
            x += Move.position_difference[move].x;
            return Move.isInsideFieldLimits(x, y) && Move.isEmptyField(template, x, y);
        }
        else if (move.startsWith('goal_kick')) {
            const is_in_position = Move.playerIsAtGoalPosition(template, x, y);
            if (!is_in_position) return false;
            const kick_side = ['left', 'up', 'right'].indexOf(move.split('_')[2]);
            return kick_side !== template.goalkeeper_side;

        }
        else {
            let y = template.main_player_position.y;
            let x = template.main_player_position.x;
            if (move === 'ball_pass_up') {
                for (let i = y - 1; i >= 0; i--) {
                    let ptr = template.player_ptr_grid[i][x];
                    if (ptr === -1) continue;
                    if (template.player_list[ptr].team === template.friend_team) return true;
                    return false;
                }
            }
            else if (move === 'ball_pass_right') {
                for (let i = x + 1; i < Configs.game.field_cols; i++) {
                    let ptr = template.player_ptr_grid[y][i];
                    if (ptr === -1) continue;
                    if (template.player_list[ptr].team === template.friend_team) return true;
                    return false;
                }
            }
            else if (move === 'ball_pass_down') {
                for (let i = y + 1; i < Configs.game.field_rows; i++) {
                    let ptr = template.player_ptr_grid[i][x];
                    if (ptr === -1) continue;
                    if (template.player_list[ptr].team === template.friend_team) return true;
                    return false;
                }
            }
            else {
                for (let i = x - 1; i >= 0; i--) {
                    let ptr = template.player_ptr_grid[y][i];
                    if (ptr === -1) continue;
                    if (template.player_list[ptr].team === template.friend_team) return true;
                    return false;
                }
            }
        }
    }

    static isInsideFieldLimits(x, y) {
        return x >= 0 && y >= 0 && x < Configs.game.field_cols && y < Configs.game.field_rows;
    }

    static isEmptyField(template, x, y) {
        return template.player_ptr_grid[y][x] === -1;
    }

    static playerIsAtGoalPosition(template, x, y) {
        return x === template.goalkeeper_position.x && y === template.goalkeeper_position.y;
    }

    static makeMove(template, move) {
        if (move.startsWith('player_move')) {
            template.player_list[0].x += Move.position_difference[move].x;
            template.player_list[0].y += Move.position_difference[move].y;
            template.ball.x += Move.position_difference[move].x;
            template.ball.y += Move.position_difference[move].y;
            return;
        }
        if (move.startsWith('ball_pass')) {
            template.ball.x += Move.position_difference[move].x;
            template.ball.y += Move.position_difference[move].y;
            return;
        }
        if (move.startsWith('goal_kick') && template.task_number <= 3) {
            return;
        }
    }
}
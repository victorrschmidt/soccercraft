/**
 * Classe que instancia um objeto a ser renderizado no canvas.
 */
export default class Entity {
    constructor(src, x, y, width, height) {
        this.image = new Image();
        this.image.src = src;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.loaded = false;
        this.image.onload = () => { this.loaded = true; };
    }

    /**
     * Renderizar a entidade.
     */
    draw(ctx) {
        if (this.loaded) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
    }
}
class Card extends Phaser.GameObjects.Image {
    constructor(scene, value) {
        super (scene, 0, 0, 'card' );
        this.scene = scene;
        this.value = value;
        this.opened = false;
        this.setScale(0.5);
        this.scene.add.existing(this);
        this.setInteractive();
      
        }
        init(position) {
            if (!position) {
            console.error("Position is undefined for card!", this);
            return;
        }
            this.position = position;
            this.close();
            this.setPosition( -this.width, -this.height)
        }

        move(params) {
              this.scene.tweens.add({
                targets: this,
                x: params.x,
                y: params.y,
                delay: params.delay,
                ease: 'Linear',
                duration: 300,
                onComplete: () => {
                    if(params.callback) {
                        params.callback()
                    }
                }
            })
        } 

        flip() {
            this.scene.tweens.add({
                targets: this,
                scaleX: 0,
                ease: 'Linear',
                duration: 150,
                onComplete: () => {
                    this.show()
                }
            })
        }
        show( ) {
            let texture = this.opened ? `card${this.value}` : 'card';
            this.setTexture(texture);   
            this.scene.tweens.add({
                    targets: this,
                    scaleX: 0.5,
                    ease: 'Linear',
                    duration: 150
                })
        }
        open() {
            this.opened = true;
            this.flip();
            
            
        }
        close() {
            if(this.opened) {
                this.opened = false;
                this.flip(); 
            }
            
            
        }
        destroy(fromScene) {
        // Убираем интерактивность перед уничтожением
        this.disableInteractive();
        super.destroy(fromScene);
    }


}

class GameScene extends Phaser.Scene {
    constructor() {
        super("Game");

    }
    preload() {
        this.load.image('bg', 'assets/images/bg.jpg');
        this.load.image('card', 'assets/images/card_back.png');
        this.load.image('card1', 'assets/images/card1.png');
        this.load.image('card2', 'assets/images/card2.png');
        this.load.image('card3', 'assets/images/card3.png');
        this.load.image('card4', 'assets/images/card4.png');
        this.load.image('card5', 'assets/images/card5.png');

        this.load.audio('theme', 'assets/sounds/theme.wav');
        this.load.audio('fail', 'assets/sounds/fail.wav');
        this.load.audio('open', 'assets/sounds/open.wav');
        this.load.audio('pair', 'assets/sounds/pair.wav');
        this.load.audio('win', 'assets/sounds/win.wav');
    }
    createText(){
            this.timeOutText = this.add.text(100, 450, `Time: ${this.timeout}`, {
            font: '100px Arial',
            fill: '#fff'
        });
    }
    
    createTimer() {
        this.timer = this.time.addEvent({
            delay:1000,
            callback: this.onTimerTick, 
            callbackScope: this, 
            loop: true
        })
    }
    onTimerTick() {
        if(this.timeout <= 0) {
            this.timer.paused = true;
            this.sounds.fail.play({
            volume: 0.15
        });
            this.restart('lose');
        } else {
           this.timeout--; 
        }
        
        if (this.timeOutText) {
            this.timeOutText.setText(`Time: ${this.timeout}`);
        }
    }

    createSound() {
        this.sounds = {
            theme: this.sound.add('theme'),
            fail: this.sound.add('fail'),
            open: this.sound.add('open'),
            pair: this.sound.add('pair'),
            win: this.sound.add('win')
        }
        this.sounds.theme.play({
            volume: 0.07,
            loop: true
        })
    }
   
    create() {
        this.timeout = config.timeout;
        this.createSound();
        this.createBackground();
        this.createText();
        this.createUI();
        this.createTimer();
        this.createCards();
        this.start();
    }
    createUI() {
        // Контейнер для элементов UI
        this.uiContainer = this.add.container(0, 0);
        
        // Создаем панель результатов (скрыта по умолчанию)
        this.resultPanel = this.add.rectangle(
            this.sys.game.config.width / 2,
            this.sys.game.config.height / 2,
            500, 300,
            0x333333, 0.9
        ).setStrokeStyle(4, 0xffffff).setVisible(false);
        
        this.resultText = this.add.text(
            this.sys.game.config.width / 2,
            this.sys.game.config.height / 2 - 50,
            "",
            { font: '48px Arial', fill: '#ffffff', align: 'center' }
        ).setOrigin(0.5).setVisible(false);
        
        this.restartButton = this.add.text(
            this.sys.game.config.width / 2,
            this.sys.game.config.height / 2 + 50,
            "Играть снова",
            { font: '36px Arial', fill: '#ffff00' }
        ).setOrigin(0.5).setInteractive().setVisible(false);
        
        this.restartButton.on('pointerdown', () => {
            this.hideResultPanel();
            this.newGame();
        });
        
        // Добавляем элементы в контейнер
        this.uiContainer.add([
            this.resultPanel,
            this.resultText,
            this.restartButton
        ]).setDepth(1000);
    }

    // Показать панель результатов
    showResultPanel(message) {
        this.resultText.setText(message);
        
        // Анимация появления
        this.tweens.add({
            targets: this.uiContainer,
            alpha: 0,
            duration: 0,
            onComplete: () => {
                this.resultPanel.setVisible(true);
                this.resultText.setVisible(true);
                this.restartButton.setVisible(true);
                
                this.tweens.add({
                    targets: this.uiContainer,
                    alpha: 1,
                    duration: 500
                });
            }
        });
    }

    // Скрыть панель результатов
    hideResultPanel() {
        this.tweens.add({
            targets: this.uiContainer,
            alpha: 0,
            duration: 300,
            onComplete: () => {
                this.resultPanel.setVisible(false);
                this.resultText.setVisible(false);
                this.restartButton.setVisible(false);
            }
        });
    }
      restart(result) {
        // Отключаем клики во время анимации
        this.input.off("gameobjectdown", this.onCardClicked, this);
        
        // Останавливаем таймер
        this.timer.paused = true;
        
        let count = 0;
        const onCardMoveComplete = () => {
            ++count;
            if(count >= this.cards.length) {
                // Показываем результат только если игра завершилась
                if(result) {
                    if(result === 'win') {
                        this.showResultPanel("Вы выиграли!");
                    } else {
                        this.showResultPanel("Вы проиграли!\nПопробуете еще раз?");
                    }
                }
            }
        };
        
        const screenWidth = this.sys.game.config.width;
        const screenHeight = this.sys.game.config.height;
        
        this.cards.forEach((card, index) => {
            card.setDepth(1000);
            
            // Параметры анимации
            const delay = index * 100;
            const targetX = screenWidth + card.displayWidth;
            const targetY = screenHeight + card.displayHeight;
            
            card.move({
                x: targetX,
                y: targetY,
                delay: delay,
                callback: onCardMoveComplete
            });
        });
    }
    
    // Добавляем новый метод для перезапуска игры
    newGame() {
        // Сбрасываем состояние игры
        this.timeout = config.timeout;
        this.openedCard = null;
        this.openCardCount = 0;
        
        // Обновляем текст времени
        if (this.timeOutText) {
            this.timeOutText.setText(`Time: ${this.timeout}`);
        }
        
        // Скрываем панель результатов
        this.hideResultPanel();
        
        // Удаляем старые карты
        this.destroyCards();
        
        // Создаем новые карты
        this.createCards();
        
        // Инициализируем новые карты
        this.initCards();
        
        // Показываем новые карты
        this.showCards();
        
        // Включаем таймер и обработку кликов
        this.timer.paused = false;
        this.input.on("gameobjectdown", this.onCardClicked, this);
    }
    destroyCards() {
        if (this.cards) {
            // Удаляем все карты и очищаем массив
            this.cards.forEach(card => {
                card.destroy(true); // Уничтожаем с удалением из сцены
            });
            this.cards = [];
        }
        // Удаляем обработчик кликов
        this.input.off("gameobjectdown", this.onCardClicked, this);
    }
    start() {
        
     this.newGame();
    }

    initCards() {
        let positions = this.getCardPosition();
        
        this.cards.forEach(card => {
            card.init(positions.pop());
        })
    }
    
    showCards() {
        this.cards.forEach(card => {
            card.depth = card.position.delay
            card.move({
                x: card.position.x,
                y: card.position.y,
                delay: card.position.delay
            });
        })
    }

    createBackground() {
         this.add.image(0, 0, 'bg').setOrigin(0, 0).setScale(1, 0.7);
    }

    createCards() {
        this.cards = []
        for (let value of config.cards) {
            for (let i = 0; i < 2; i++) {
                this.cards.push(new Card(this, value ));  
            }
        }
        this.input.on("gameobjectdown", this.onCardClicked, this)
    }

    onCardClicked(pointer, card) {
        if (!(card instanceof Card) || card.opened || this.timer.paused) {
            return false;
        }
        this.sounds.open.play({
            volume: 0.1
        });
        if (this.openedCard) {
            if(this.openedCard.value === card.value) {
                  this.sounds.pair.play({
                    volume: 0.13
                });
                this.openedCard = null;
                ++this.openCardCount;
            } else {
                this.openedCard.close();
                this.openedCard = card;
            }
            
        } else {
            this.openedCard = card;
        }
        card.open();
        if(this.openCardCount === this.cards.length / 2) {
            // Победа - запускаем анимацию вылета с флагом победы
              this.sounds.win.play({
            volume: 0.15
        });
            this.restart('win');
        }
    }
    
    getCardPosition() {
        let positions = [] ;
        let coof = 0.5;
        let cardTexture = this.textures.get('card').getSourceImage();
        let cardWidth = cardTexture.width * coof;
        let cardHeight = cardTexture.height * coof;
        let offsetX = (this.sys.game.config.width  - cardWidth * config.cols) / 2 + cardWidth / 2 ;
        let offsetY = (this.sys.game.config.height  - cardHeight * config.rows) / 2 + cardHeight / 2 ;
        let id =0;
        for(let row =0; row < config.rows; row++) {
            for (let col = 0 ; col < config.cols; col ++) {
                ++id;
                positions.push({
                    delay: id *100,
                    x: offsetX + col * cardWidth,
                    y: offsetY + row * cardHeight
                })
            }
        }
        
        return Phaser.Utils.Array.Shuffle(positions);
        }
}






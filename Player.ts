import { _decorator, Component, Node, Vec3, tween, v3, UITransform, EventTouch, log, Button, Label, Color, Sprite } from 'cc';
const { ccclass, property } = _decorator;

// 常量定义
const kCardSpacing: number = 20; // 卡牌堆叠间距
const kStartCardValue: number = 3; // 起始卡牌数值
const kEndCardValue: number = 10; // 结束卡牌数值
const kMaxCardsPerSuit: number = 8; // 每个花色最大卡牌数
const kDelayBeforeSuccessPopup: number = 1.0; // 成功弹窗延迟显示时间
const kCardSizeWidth: number = 100; // 卡牌宽度
const kCardSizeHeight: number = 140; // 卡牌高度
const kErrorPopupWidth: number = 350; // 错误弹窗宽度
const kErrorPopupHeight: number = 150; // 错误弹窗高度

/**
 * 玩家主类
 * 职责：卡牌游戏的视图和控制器，处理卡牌点击、移动、验证等核心逻辑
 */
@ccclass('Player')
export class Player extends Component {
    // 方块卡牌节点引用
    @property(Node)
    public squareThreeNode: Node = null!;
    @property(Node)
    public squareFourNode: Node = null!;
    @property(Node)
    public squareFiveNode: Node = null!;
    @property(Node)
    public squareSixNode: Node = null!;
    @property(Node)
    public squareSevenNode: Node = null!;
    @property(Node)
    public squareEightNode: Node = null!;
    @property(Node)
    public squareNineNode: Node = null!;
    @property(Node)
    public squareTenNode: Node = null!;

    // 红桃卡牌节点引用
    @property(Node)
    public heartThreeNode: Node = null!;
    @property(Node)
    public heartFourNode: Node = null!;
    @property(Node)
    public heartFiveNode: Node = null!;
    @property(Node)
    public heartSixNode: Node = null!;
    @property(Node)
    public heartSevenNode: Node = null!;
    @property(Node)
    public heartEightNode: Node = null!;
    @property(Node)
    public heartNineNode: Node = null!;
    @property(Node)
    public heartTenNode: Node = null!;

    // 黑桃卡牌节点引用
    @property(Node)
    public spadeThreeNode: Node = null!;
    @property(Node)
    public spadeFourNode: Node = null!;
    @property(Node)
    public spadeFiveNode: Node = null!;
    @property(Node)
    public spadeSixNode: Node = null!;
    @property(Node)
    public spadeSevenNode: Node = null!;
    @property(Node)
    public spadeEightNode: Node = null!;
    @property(Node)
    public spadeNineNode: Node = null!;
    @property(Node)
    public spadeTenNode: Node = null!;

    // 梅花卡牌节点引用
    @property(Node)
    public clubThreeNode: Node = null!;
    @property(Node)
    public clubFourNode: Node = null!;
    @property(Node)
    public clubFiveNode: Node = null!;
    @property(Node)
    public clubSixNode: Node = null!;
    @property(Node)
    public clubSevenNode: Node = null!;
    @property(Node)
    public clubEightNode: Node = null!;
    @property(Node)
    public clubNineNode: Node = null!;
    @property(Node)
    public clubTenNode: Node = null!;

    // 成功提示弹窗
    @property(Node)
    public successPopup: Node = null!;
    @property(Label)
    public titleLabel: Label = null!;
    @property(Label)
    public contentLabel: Label = null!;
    @property(Button)
    public confirmButton: Button = null!;

    // 堆叠目标位置
    @property(Vec3)
    public squareStackPosition: Vec3 = new Vec3(-300, 0, 0);
    @property(Vec3)
    public heartStackPosition: Vec3 = new Vec3(-100, 0, 0);
    @property(Vec3)
    public spadeStackPosition: Vec3 = new Vec3(100, 0, 0);
    @property(Vec3)
    public clubStackPosition: Vec3 = new Vec3(300, 0, 0);

    // 私有属性
    private _cardPositions: Map<Node, Vec3> = new Map();
    private _cardValues: Map<Node, number> = new Map();
    private _cardSuits: Map<Node, string> = new Map();
    
    // 四个完全独立的堆叠
    private _squareStack: Node[] = [];
    private _heartStack: Node[] = [];
    private _spadeStack: Node[] = [];
    private _clubStack: Node[] = [];
    
    // 错误提示弹窗相关
    private _errorPopup: Node = null!;
    private _errorLabel: Label = null!;
    private _errorOkButton: Button = null!;

    // 游戏状态控制变量
    private _isGameBlocked: boolean = false;
    private _blockedCard: Node | null = null;
    private _pendingCardClick: boolean = false;
    private _isGameCompleted: boolean = false;

    /**
     * 组件加载时初始化
     */
    onLoad() {
        log("四花色独立序列堆叠系统启动");
        this._initializeCardSystem();
        this._initializeErrorPopup();
        this._initializeSuccessPopup();
    }

    // ==================== 私有方法 ====================

    /**
     * 初始化卡牌系统
     */
    private _initializeCardSystem(): void {
        const allCards = this._getAllCardData();
        let validCardCount = 0;
        
        for (let i = 0; i < allCards.length; i++) {
            const cardInfo = allCards[i];
            if (cardInfo.node !== null) {
                const card = cardInfo.node;
                this._cardPositions.set(card, card.position.clone());
                this._cardValues.set(card, cardInfo.value);
                this._cardSuits.set(card, cardInfo.suit);
                this._setupCardClick(card);
                log("设置卡牌 " + card.name + " 的点击事件");
                validCardCount++;
            }
        }

        log("找到 " + validCardCount + " 张卡牌");
    }

    /**
     * 获取所有卡牌数据
     * @returns 卡牌数据数组
     */
    private _getAllCardData(): Array<{ node: Node, suit: string, value: number }> {
        return [
            // 方块卡牌
            { node: this.squareThreeNode, suit: "方块", value: 3 },
            { node: this.squareFourNode, suit: "方块", value: 4 },
            { node: this.squareFiveNode, suit: "方块", value: 5 },
            { node: this.squareSixNode, suit: "方块", value: 6 },
            { node: this.squareSevenNode, suit: "方块", value: 7 },
            { node: this.squareEightNode, suit: "方块", value: 8 },
            { node: this.squareNineNode, suit: "方块", value: 9 },
            { node: this.squareTenNode, suit: "方块", value: 10 },
            
            // 红桃卡牌
            { node: this.heartThreeNode, suit: "红桃", value: 3 },
            { node: this.heartFourNode, suit: "红桃", value: 4 },
            { node: this.heartFiveNode, suit: "红桃", value: 5 },
            { node: this.heartSixNode, suit: "红桃", value: 6 },
            { node: this.heartSevenNode, suit: "红桃", value: 7 },
            { node: this.heartEightNode, suit: "红桃", value: 8 },
            { node: this.heartNineNode, suit: "红桃", value: 9 },
            { node: this.heartTenNode, suit: "红桃", value: 10 },
            
            // 黑桃卡牌
            { node: this.spadeThreeNode, suit: "黑桃", value: 3 },
            { node: this.spadeFourNode, suit: "黑桃", value: 4 },
            { node: this.spadeFiveNode, suit: "黑桃", value: 5 },
            { node: this.spadeSixNode, suit: "黑桃", value: 6 },
            { node: this.spadeSevenNode, suit: "黑桃", value: 7 },
            { node: this.spadeEightNode, suit: "黑桃", value: 8 },
            { node: this.spadeNineNode, suit: "黑桃", value: 9 },
            { node: this.spadeTenNode, suit: "黑桃", value: 10 },
            
            // 梅花卡牌
            { node: this.clubThreeNode, suit: "梅花", value: 3 },
            { node: this.clubFourNode, suit: "梅花", value: 4 },
            { node: this.clubFiveNode, suit: "梅花", value: 5 },
            { node: this.clubSixNode, suit: "梅花", value: 6 },
            { node: this.clubSevenNode, suit: "梅花", value: 7 },
            { node: this.clubEightNode, suit: "梅花", value: 8 },
            { node: this.clubNineNode, suit: "梅花", value: 9 },
            { node: this.clubTenNode, suit: "梅花", value: 10 }
        ];
    }

    /**
     * 初始化错误提示弹窗
     */
    private _initializeErrorPopup(): void {
        // 创建错误提示弹窗节点
        this._errorPopup = new Node("ErrorPopup");
        this._errorPopup.parent = this.node;
        this._errorPopup.setPosition(0, 0, 0);
        
        const uiTransform = this._errorPopup.addComponent(UITransform);
        uiTransform.width = kErrorPopupWidth;
        uiTransform.height = kErrorPopupHeight;
        uiTransform.anchorX = 0.5;
        uiTransform.anchorY = 0.5;
        
        const sprite = this._errorPopup.addComponent(Sprite);
        sprite.color = new Color(50, 50, 50, 220);
        
        // 添加错误文本
        const errorTextNode = new Node("ErrorText");
        errorTextNode.parent = this._errorPopup;
        errorTextNode.setPosition(0, 20, 0);
        
        const textUITransform = errorTextNode.addComponent(UITransform);
        textUITransform.width = 300;
        textUITransform.height = 80;
        
        this._errorLabel = errorTextNode.addComponent(Label);
        this._errorLabel.string = "";
        this._errorLabel.fontSize = 20;
        this._errorLabel.color = Color.RED;
        this._errorLabel.horizontalAlign = Label.HorizontalAlign.CENTER;
        this._errorLabel.lineHeight = 25;
        
        // 添加确定按钮
        const okButtonNode = new Node("ErrorOkButton");
        okButtonNode.parent = this._errorPopup;
        okButtonNode.setPosition(0, -40, 0);
        
        const buttonUITransform = okButtonNode.addComponent(UITransform);
        buttonUITransform.width = 80;
        buttonUITransform.height = 40;
        
        this._errorOkButton = okButtonNode.addComponent(Button);
        this._errorOkButton.transition = Button.Transition.SCALE;
        this._errorOkButton.duration = 0.1;
        this._errorOkButton.zoomScale = 1.1;
        
        // 按钮文本
        const buttonLabelNode = new Node("ErrorButtonLabel");
        buttonLabelNode.parent = okButtonNode;
        const buttonLabel = buttonLabelNode.addComponent(Label);
        buttonLabel.string = "确定";
        buttonLabel.fontSize = 18;
        buttonLabel.color = Color.WHITE;
        buttonLabel.horizontalAlign = Label.HorizontalAlign.CENTER;
        
        // 按钮点击事件
        this._errorOkButton.node.on(Node.EventType.TOUCH_END, () => {
            this._resumeGameAfterError();
        }, this);
        
        // 初始隐藏
        this._hideErrorPopup();
        log("错误提示弹窗初始化完成");
    }
    
    /**
     * 初始化成功提示弹窗
     */
    private _initializeSuccessPopup(): void {
        if (this.successPopup) {
            // 确保初始是隐藏的
            this.successPopup.active = false;
            
            if (this.confirmButton) {
                this.confirmButton.node.on(Node.EventType.TOUCH_END, () => {
                    log("点击成功弹窗确定按钮");
                    this._hideSuccessPopup();
                    this.resetAllCards();
                }, this);
            }
            log("成功提示弹窗初始化完成");
        } else {
            log("警告: 成功提示弹窗节点未设置");
        }
    }

    /**
     * 设置卡牌点击事件
     * @param cardNode 卡牌节点
     */
    private _setupCardClick(cardNode: Node): void {
        let uiTransform = cardNode.getComponent(UITransform);
        if (!uiTransform) {
            uiTransform = cardNode.addComponent(UITransform);
            uiTransform.width = kCardSizeWidth;
            uiTransform.height = kCardSizeHeight;
        }

        let button = cardNode.getComponent(Button);
        if (!button) {
            button = cardNode.addComponent(Button);
            button.transition = Button.Transition.SCALE;
            button.duration = 0.1;
            button.zoomScale = 1.05;
        }

        cardNode.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
            this._onCardClicked(cardNode);
        }, this);
    }

    /**
     * 卡牌点击处理
     * @param clickedCard 点击的卡牌
     */
    private _onCardClicked(clickedCard: Node): void {
        // 检查游戏是否已完成
        if (this._isGameCompleted) {
            log("游戏已完成，点击无效");
            return;
        }
        
        // 检查游戏是否被阻止
        if (this._isGameBlocked) {
            log("游戏被阻止，点击无效，请先处理错误提示");
            this._pendingCardClick = true;
            this._blockedCard = clickedCard;
            return;
        }
        
        const cardSuit = this._cardSuits.get(clickedCard) || "未知";
        const cardValue = this._cardValues.get(clickedCard) || 0;
        
        log("点击了卡牌: " + clickedCard.name + " (花色: " + cardSuit + ", 数值: " + cardValue + ")");

        if (this._isCardInStack(clickedCard)) {
            this._showError(clickedCard.name + " 已经在堆叠中！", clickedCard);
            return;
        }

        if (!this._isValidClickOrderForSuit(clickedCard)) {
            const expectedCard = this._getExpectedNextCardNameForSuit(clickedCard);
            this._showError("顺序错误！请先点击 " + expectedCard, clickedCard);
            return;
        }

        const targetPosition = this._getStackTargetPosition(clickedCard);
        this._moveCardToStack(clickedCard, targetPosition);
    }

    /**
     * 检查卡牌是否在堆叠中
     * @param card 卡牌节点
     * @returns 是否在堆叠中
     */
    private _isCardInStack(card: Node): boolean {
        const suit = this._cardSuits.get(card) || "未知";
        
        if (suit === "方块") {
            return this._arrayContains(this._squareStack, card);
        } else if (suit === "红桃") {
            return this._arrayContains(this._heartStack, card);
        } else if (suit === "黑桃") {
            return this._arrayContains(this._spadeStack, card);
        } else if (suit === "梅花") {
            return this._arrayContains(this._clubStack, card);
        } else {
            return false;
        }
    }

    /**
     * 检查数组是否包含元素（兼容性方法，解决includes问题）
     * @param array 数组
     * @param item 元素
     * @returns 是否包含
     */
    private _arrayContains(array: Node[], item: Node): boolean {
        for (let i = 0; i < array.length; i++) {
            if (array[i] === item) {
                return true;
            }
        }
        return false;
    }

    /**
     * 检查点击顺序是否正确
     * @param clickedCard 点击的卡牌
     * @returns 顺序是否正确
     */
    private _isValidClickOrderForSuit(clickedCard: Node): boolean {
        const clickedCardSuit = this._cardSuits.get(clickedCard) || "未知";
        const clickedCardValue = this._cardValues.get(clickedCard) || 0;
        
        let stack: Node[] = [];
        if (clickedCardSuit === "方块") {
            stack = this._squareStack;
        } else if (clickedCardSuit === "红桃") {
            stack = this._heartStack;
        } else if (clickedCardSuit === "黑桃") {
            stack = this._spadeStack;
        } else if (clickedCardSuit === "梅花") {
            stack = this._clubStack;
        }
        
        if (stack.length === 0) {
            return clickedCardValue === kStartCardValue;
        }
        
        const topCard = stack[stack.length - 1];
        const topCardValue = this._cardValues.get(topCard) || 0;
        return clickedCardValue === topCardValue + 1;
    }

    /**
     * 获取期望的下一个卡牌名称
     * @param clickedCard 点击的卡牌
     * @returns 期望的卡牌名称
     */
    private _getExpectedNextCardNameForSuit(clickedCard: Node): string {
        const clickedCardSuit = this._cardSuits.get(clickedCard) || "未知";
        
        let stack: Node[] = [];
        if (clickedCardSuit === "方块") {
            stack = this._squareStack;
        } else if (clickedCardSuit === "红桃") {
            stack = this._heartStack;
        } else if (clickedCardSuit === "黑桃") {
            stack = this._spadeStack;
        } else if (clickedCardSuit === "梅花") {
            stack = this._clubStack;
        }
        
        if (stack.length === 0) {
            return clickedCardSuit + kStartCardValue.toString();
        }
        
        const topCard = stack[stack.length - 1];
        const topCardValue = this._cardValues.get(topCard) || 0;
        const nextCardValue = topCardValue + 1;
        
        if (nextCardValue <= kEndCardValue) {
            return clickedCardSuit + nextCardValue.toString();
        } else {
            return clickedCardSuit + "序列完成";
        }
    }

    /**
     * 获取堆叠目标位置
     * @param card 卡牌节点
     * @returns 目标位置
     */
    private _getStackTargetPosition(card: Node): Vec3 {
        const suit = this._cardSuits.get(card) || "未知";
        let basePosition: Vec3 = new Vec3();
        let stack: Node[] = [];
        
        if (suit === "方块") {
            basePosition = this.squareStackPosition.clone();
            stack = this._squareStack;
        } else if (suit === "红桃") {
            basePosition = this.heartStackPosition.clone();
            stack = this._heartStack;
        } else if (suit === "黑桃") {
            basePosition = this.spadeStackPosition.clone();
            stack = this._spadeStack;
        } else {
            basePosition = this.clubStackPosition.clone();
            stack = this._clubStack;
        }
        
        const stackOffset = stack.length * kCardSpacing;
        return new Vec3(basePosition.x, basePosition.y + stackOffset, basePosition.z);
    }

    /**
     * 移动卡牌到堆叠
     * @param cardNode 卡牌节点
     * @param targetPosition 目标位置
     */
    private _moveCardToStack(cardNode: Node, targetPosition: Vec3): void {
        const cardSuit = this._cardSuits.get(cardNode) || "未知";
        const cardValue = this._cardValues.get(cardNode) || 0;
        
        log("移动 " + cardNode.name + " 到" + cardSuit + "堆叠");

        tween(cardNode)
            .to(0.8, { position: targetPosition })
            .call(() => {
                this._addCardToStack(cardNode);
            })
            .start();
    }

    /**
     * 添加卡牌到堆叠
     * @param cardNode 卡牌节点
     */
    private _addCardToStack(cardNode: Node): void {
        const cardSuit = this._cardSuits.get(cardNode) || "未知";
        const cardValue = this._cardValues.get(cardNode) || 0;
        
        // 添加到对应的堆叠
        if (cardSuit === "方块") {
            this._squareStack.push(cardNode);
        } else if (cardSuit === "红桃") {
            this._heartStack.push(cardNode);
        } else if (cardSuit === "黑桃") {
            this._spadeStack.push(cardNode);
        } else if (cardSuit === "梅花") {
            this._clubStack.push(cardNode);
        }
        
        // 调整渲染顺序
        this._bringCardToFront(cardNode);
        
        log(cardNode.name + " 已添加到" + cardSuit + "堆叠");
        log(cardSuit + "堆叠进度: " + this._getStackLength(cardSuit) + "/" + kMaxCardsPerSuit);
        
        this._showSuccess(cardNode.name + " 添加成功！");
        this._checkGameCompletion();
        this._logCurrentStacks();
    }

    /**
     * 获取堆叠长度
     * @param suit 花色
     * @returns 堆叠长度
     */
    private _getStackLength(suit: string): number {
        if (suit === "方块") {
            return this._squareStack.length;
        } else if (suit === "红桃") {
            return this._heartStack.length;
        } else if (suit === "黑桃") {
            return this._spadeStack.length;
        } else if (suit === "梅花") {
            return this._clubStack.length;
        }
        return 0;
    }

    /**
     * 显示成功信息
     * @param message 成功信息
     */
    private _showSuccess(message: string): void {
        log("成功: " + message);
    }

    /**
     * 检查游戏是否完成
     */
    private _checkGameCompletion(): void {
        const completedStacks = [];
        if (this._squareStack.length === kMaxCardsPerSuit) completedStacks.push("方块");
        if (this._heartStack.length === kMaxCardsPerSuit) completedStacks.push("红桃");
        if (this._spadeStack.length === kMaxCardsPerSuit) completedStacks.push("黑桃");
        if (this._clubStack.length === kMaxCardsPerSuit) completedStacks.push("梅花");
        
        log("检查游戏完成状态: " + completedStacks.length + "个堆叠完成");
        
        if (completedStacks.length > 0) {
            if (completedStacks.length === 4) {
                log("🎉 游戏完成！所有花色序列全部完成！");
                this._isGameCompleted = true;
                
                // 延迟显示成功弹窗
                this.scheduleOnce(() => {
                    log("开始显示成功弹窗");
                    this._showSuccessPopup();
                }, kDelayBeforeSuccessPopup);
                
            } else {
                log(completedStacks.join("、") + "序列完成！");
            }
        }
    }

    /**
     * 显示成功弹窗
     */
    private _showSuccessPopup(): void {
        log("尝试显示成功弹窗");
        
        if (this.successPopup) {
            log("成功弹窗节点存在");
            
            if (this.titleLabel) {
                this.titleLabel.string = "🎉 挑战完成！";
                log("设置标题成功");
            } else {
                log("错误: titleLabel 未设置");
            }
            
            if (this.contentLabel) {
                this.contentLabel.string = "恭喜你成功完成了所有卡牌的堆叠挑战！\n你的顺序感和记忆力非常出色！";
                log("设置内容成功");
            } else {
                log("错误: contentLabel 未设置");
            }
            
            this.successPopup.active = true;
            this.successPopup.setScale(0, 0, 0);
            
            log("开始弹窗显示动画");
            
            tween(this.successPopup)
                .to(0.8, { scale: new Vec3(1, 1, 1) }, { easing: 'elasticOut' })
                .call(() => {
                    log("成功弹窗显示完成");
                })
                .start();
            
        } else {
            log("错误: 成功弹窗节点不存在，使用备用方案");
            setTimeout(() => {
                alert("🎉 恭喜完成挑战！\n所有卡牌已按顺序堆叠完成！\n点击确定重新开始游戏");
                this.resetAllCards();
            }, 500);
        }
    }

    /**
     * 显示错误消息
     * @param message 错误信息
     * @param clickedCard 点击的卡牌
     */
    private _showError(message: string, clickedCard?: Node): void {
        log("错误: " + message);
        this._showErrorPopup(message, clickedCard);
        this._shakeCard(this._getCurrentTopCardForSuit(message));
    }

    /**
     * 显示错误弹窗
     * @param message 错误信息
     * @param clickedCard 点击的卡牌
     */
    private _showErrorPopup(message: string, clickedCard?: Node): void {
        if (this._errorLabel) {
            this._errorLabel.string = message;
        }
        
        // 阻止游戏进行
        this._blockGame(clickedCard);
        
        this._errorPopup.active = true;
        this._errorPopup.setScale(0, 0, 0);
        
        tween(this._errorPopup)
            .to(0.3, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' })
            .start();
            
        log("显示错误弹窗并阻止游戏: " + message);
    }
    
    /**
     * 隐藏错误弹窗
     */
    private _hideErrorPopup(): void {
        tween(this._errorPopup)
            .to(0.2, { scale: new Vec3(0, 0, 0) }, { easing: 'backIn' })
            .call(() => {
                this._errorPopup.active = false;
            })
            .start();
    }

    /**
     * 隐藏成功弹窗
     */
    private _hideSuccessPopup(): void {
        if (this.successPopup) {
            tween(this.successPopup)
                .to(0.3, { scale: new Vec3(0, 0, 0) }, { easing: 'backIn' })
                .call(() => {
                    this.successPopup.active = false;
                    log("成功弹窗已隐藏");
                })
                .start();
        }
    }

    /**
     * 抖动卡牌
     * @param cardNode 卡牌节点
     */
    private _shakeCard(cardNode: Node | null): void {
        if (!cardNode) return;
        
        const originalPos = cardNode.position.clone();
        tween(cardNode)
            .to(0.1, { position: v3(originalPos.x + 5, originalPos.y, originalPos.z) })
            .to(0.1, { position: v3(originalPos.x - 5, originalPos.y, originalPos.z) })
            .to(0.1, { position: v3(originalPos.x + 5, originalPos.y, originalPos.z) })
            .to(0.1, { position: originalPos })
            .start();
    }

    /**
     * 获取堆叠顶部卡牌
     * @param errorMessage 错误信息
     * @returns 顶部卡牌
     */
    private _getCurrentTopCardForSuit(errorMessage: string): Node | null {
        if (errorMessage.includes("方块")) {
            if (this._squareStack.length > 0) {
                return this._squareStack[this._squareStack.length - 1];
            }
        } else if (errorMessage.includes("红桃")) {
            if (this._heartStack.length > 0) {
                return this._heartStack[this._heartStack.length - 1];
            }
        } else if (errorMessage.includes("黑桃")) {
            if (this._spadeStack.length > 0) {
                return this._spadeStack[this._spadeStack.length - 1];
            }
        } else if (errorMessage.includes("梅花")) {
            if (this._clubStack.length > 0) {
                return this._clubStack[this._clubStack.length - 1];
            }
        }
        return null;
    }

    /**
     * 调整卡牌渲染顺序
     * @param cardNode 卡牌节点
     */
    private _bringCardToFront(cardNode: Node): void {
        const parent = cardNode.parent;
        if (parent) {
            cardNode.setSiblingIndex(parent.children.length - 1);
        }
    }

    /**
     * 记录当前堆叠状态
     */
    private _logCurrentStacks(): void {
        log("当前堆叠状态:");
        
        const suits = ["方块", "红桃", "黑桃", "梅花"];
        for (const suit of suits) {
            log(suit + "堆叠（从下到上）:");
            let stack: Node[] = [];
            if (suit === "方块") {
                stack = this._squareStack;
            } else if (suit === "红桃") {
                stack = this._heartStack;
            } else if (suit === "黑桃") {
                stack = this._spadeStack;
            } else if (suit === "梅花") {
                stack = this._clubStack;
            }
            
            for (let i = 0; i < stack.length; i++) {
                const card = stack[i];
                const value = this._cardValues.get(card) || 0;
                log("  " + (i + 1) + ". " + card.name + " (数值: " + value + ")");
            }
        }
        
        log("下一个可点击: " + this._getNextExpectedCardsString());
    }

    /**
     * 获取所有可点击的下一个卡牌
     * @returns 可点击卡牌字符串
     */
    private _getNextExpectedCardsString(): string {
        const suits = ["方块", "红桃", "黑桃", "梅花"];
        const expectedCards = [];
        
        for (const suit of suits) {
            const nextValue = this._getNextExpectedValue(suit);
            if (nextValue <= kEndCardValue) {
                expectedCards.push(suit + nextValue);
            }
        }
        
        return expectedCards.join(" 或 ");
    }

    /**
     * 获取花色序列的下一个期望数值
     * @param suit 花色
     * @returns 期望数值
     */
    private _getNextExpectedValue(suit: string): number {
        let stack: Node[] = [];
        if (suit === "方块") {
            stack = this._squareStack;
        } else if (suit === "红桃") {
            stack = this._heartStack;
        } else if (suit === "黑桃") {
            stack = this._spadeStack;
        } else if (suit === "梅花") {
            stack = this._clubStack;
        }
        
        if (stack.length === 0) return kStartCardValue;
        
        const topCard = stack[stack.length - 1];
        const topCardValue = this._cardValues.get(topCard) || 0;
        return topCardValue + 1;
    }

    /**
     * 阻止游戏进行
     * @param blockedCard 被阻止的卡牌
     */
    private _blockGame(blockedCard?: Node): void {
        this._isGameBlocked = true;
        this._blockedCard = blockedCard || null;
        this._pendingCardClick = false;
        
        log("游戏被阻止，需要点击确定才能继续");
        this._disableAllCards();
    }

    /**
     * 恢复游戏
     */
    private _resumeGameAfterError(): void {
        this._isGameBlocked = false;
        this._pendingCardClick = false;
        this._hideErrorPopup();
        this._enableAllCards();
        log("游戏恢复，可以继续操作");
        
        if (this._blockedCard) {
            this.scheduleOnce(() => {
                this._processPendingCardClick();
            }, 0.1);
        }
    }

    /**
     * 禁用所有卡牌点击
     */
    private _disableAllCards(): void {
        const allCards = this._getAllCardNodes();
        for (let i = 0; i < allCards.length; i++) {
            const card = allCards[i];
            if (card) {
                const button = card.getComponent(Button);
                if (button) {
                    button.interactable = false;
                }
            }
        }
        log("已禁用所有卡牌点击");
    }
    
    /**
     * 启用所有卡牌点击
     */
    private _enableAllCards(): void {
        const allCards = this._getAllCardNodes();
        for (let i = 0; i < allCards.length; i++) {
            const card = allCards[i];
            if (card) {
                const button = card.getComponent(Button);
                if (button) {
                    button.interactable = true;
                }
            }
        }
        log("已启用所有卡牌点击");
    }
    
    /**
     * 获取所有卡牌节点
     * @returns 卡牌节点数组
     */
    private _getAllCardNodes(): Node[] {
        return [
            this.squareThreeNode, this.squareFourNode, this.squareFiveNode, this.squareSixNode,
            this.squareSevenNode, this.squareEightNode, this.squareNineNode, this.squareTenNode,
            this.heartThreeNode, this.heartFourNode, this.heartFiveNode, this.heartSixNode,
            this.heartSevenNode, this.heartEightNode, this.heartNineNode, this.heartTenNode,
            this.spadeThreeNode, this.spadeFourNode, this.spadeFiveNode, this.spadeSixNode,
            this.spadeSevenNode, this.spadeEightNode, this.spadeNineNode, this.spadeTenNode,
            this.clubThreeNode, this.clubFourNode, this.clubFiveNode, this.clubSixNode,
            this.clubSevenNode, this.clubEightNode, this.clubNineNode, this.clubTenNode
        ].filter(card => card !== null);
    }
    
    /**
     * 处理等待中的卡牌点击
     */
    private _processPendingCardClick(): void {
        if (this._pendingCardClick && this._blockedCard) {
            log("处理等待中的卡牌点击: " + this._blockedCard.name);
            this._onCardClicked(this._blockedCard);
            this._blockedCard = null;
            this._pendingCardClick = false;
        }
    }

    // ==================== 公共方法 ====================

    /**
     * 重置所有卡牌位置
     */
    public resetAllCards(): void {
        log("重置所有卡牌位置");
        
        // 重置堆叠
        this._squareStack = [];
        this._heartStack = [];
        this._spadeStack = [];
        this._clubStack = [];
        
        // 重置游戏状态
        this._isGameBlocked = false;
        this._isGameCompleted = false;
        this._blockedCard = null;
        this._pendingCardClick = false;
        
        // 移动卡牌回原位
        this._cardPositions.forEach((originalPos, cardNode) => {
            tween(cardNode)
                .to(0.5, { position: originalPos.clone() })
                .start();
        });

        // 重新启用所有卡牌
        this._enableAllCards();
        
        // 隐藏所有弹窗
        this._hideErrorPopup();
        this._hideSuccessPopup();

        log("所有卡牌已重置，游戏状态已恢复");
    }

    /**
     * 显示堆叠信息
     */
    public showStackInfo(): void {
        this._logCurrentStacks();
    }

    /**
     * 测试方法：模拟点击指定卡牌
     * @param cardName 卡牌名称
     */
    public testClickCard(cardName: string): void {
        const cards = [
            // 方块卡牌
            { node: this.squareThreeNode, name: "方块3" },
            { node: this.squareFourNode, name: "方块4" },
            { node: this.squareFiveNode, name: "方块5" },
            { node: this.squareSixNode, name: "方块6" },
            { node: this.squareSevenNode, name: "方块7" },
            { node: this.squareEightNode, name: "方块8" },
            { node: this.squareNineNode, name: "方块9" },
            { node: this.squareTenNode, name: "方块10" },
            
            // 红桃卡牌
            { node: this.heartThreeNode, name: "红桃3" },
            { node: this.heartFourNode, name: "红桃4" },
            { node: this.heartFiveNode, name: "红桃5" },
            { node: this.heartSixNode, name: "红桃6" },
            { node: this.heartSevenNode, name: "红桃7" },
            { node: this.heartEightNode, name: "红桃8" },
            { node: this.heartNineNode, name: "红桃9" },
            { node: this.heartTenNode, name: "红桃10" },
            
            // 黑桃卡牌
            { node: this.spadeThreeNode, name: "黑桃3" },
            { node: this.spadeFourNode, name: "黑桃4" },
            { node: this.spadeFiveNode, name: "黑桃5" },
            { node: this.spadeSixNode, name: "黑桃6" },
            { node: this.spadeSevenNode, name: "黑桃7" },
            { node: this.spadeEightNode, name: "黑桃8" },
            { node: this.spadeNineNode, name: "黑桃9" },
            { node: this.spadeTenNode, name: "黑桃10" },
            
            // 梅花卡牌
            { node: this.clubThreeNode, name: "梅花3" },
            { node: this.clubFourNode, name: "梅花4" },
            { node: this.clubFiveNode, name: "梅花5" },
            { node: this.clubSixNode, name: "梅花6" },
            { node: this.clubSevenNode, name: "梅花7" },
            { node: this.clubEightNode, name: "梅花8" },
            { node: this.clubNineNode, name: "梅花9" },
            { node: this.clubTenNode, name: "梅花10" }
        ];

        let foundCard = null;
        for (let i = 0; i < cards.length; i++) {
            if (cards[i].name === cardName) {
                foundCard = cards[i];
                break;
            }
        }
        
        if (foundCard && foundCard.node) {
            log("测试点击: " + cardName);
            this._onCardClicked(foundCard.node);
        } else {
            log("未找到卡牌: " + cardName);
        }
    }

    /**
     * 测试方法：模拟完成游戏
     */
    public testCompleteGame(): void {
        log("测试：模拟完成游戏");
        
        // 清空堆叠
        this._squareStack = [];
        this._heartStack = [];
        this._spadeStack = [];
        this._clubStack = [];
        
        // 模拟所有卡牌都在堆叠中
        const allCards = this._getAllCardNodes();
        for (let i = 0; i < allCards.length; i++) {
            const card = allCards[i];
            if (card) {
                const suit = this._cardSuits.get(card) || "未知";
                if (suit === "方块") {
                    this._squareStack.push(card);
                } else if (suit === "红桃") {
                    this._heartStack.push(card);
                } else if (suit === "黑桃") {
                    this._spadeStack.push(card);
                } else if (suit === "梅花") {
                    this._clubStack.push(card);
                }
            }
        }
        
        // 触发完成检查
        this._checkGameCompletion();
    }
}
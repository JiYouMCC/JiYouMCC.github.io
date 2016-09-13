//最后一张特权发不出去重试次数为20次
let BLOCK_TIMES:number = 20;


enum CardType {
    身份牌 = 1,
    特权牌,
    庶民牌
}

enum PlayerCamp {
    杀手阵营,
    狼人阵营,
    平民阵营,
    自选阵营,
    Unknow
}

interface Card {
    name: string;
    type: CardType;
}

interface CardTableItem {
    card: Card;
    count: number;
}

let players: Array<Player> = [];

let cardTable: Array<CardTableItem> = [
    { card: { name: "杀手牌", type: CardType.身份牌 }, count: 1 },
    { card: { name: "狼人牌", type: CardType.身份牌 }, count: 1 },
    { card: { name: "狙击手牌", type: CardType.特权牌 }, count: 2 },
    { card: { name: "束魂牌", type: CardType.特权牌 }, count: 2 },
    { card: { name: "巫医牌", type: CardType.特权牌 }, count: 2 },
    { card: { name: "防弹衣/狼毒牌", type: CardType.特权牌 }, count: 2 },
    { card: { name: "禁锢/反狙击牌", type: CardType.特权牌 }, count: 2 },
    { card: { name: "绝杀/特赦牌", type: CardType.特权牌 }, count: 2 },
    { card: { name: "诅咒/庇佑牌", type: CardType.特权牌 }, count: 2 },
    { card: { name: "纵火/圣人牌", type: CardType.特权牌 }, count: 2 },
    { card: { name: "保镖牌", type: CardType.特权牌 }, count: 3 },
    { card: { name: "阿米巴变形牌", type: CardType.特权牌 }, count: 3 },
    { card: { name: "庶民牌", type: CardType.庶民牌 }, count: 12 }
];

let cards: Array<Card> = getCards(cardTable);

class Player {
    name: string;
    cards: Card[];
    camp: PlayerCamp;
    constructor(public playerName:string) {
        this.name = playerName;
        this.cards = [];
        this.camp = PlayerCamp.Unknow;
    }

    hasCard(cardName: string) {
        for (var i = 0; i < this.cards.length; i++) {
            if (this.cards[i].name == cardName) {
                return true;
            }
        }
        return false;
    }

    cardCount(cardName: string) {
        let result:number = 0;
        for (var i = 0; i < this.cards.length; i++) {
            if (this.cards[i].name == cardName) {
                result ++;
            }
        }
        return result;
    }

    giveCard(card:Card) {
        this.cards.push(card);
    }

    clearCards() {
        let result:Array<Card> = [];
        for(var i = 0; i < this.cards.length; i++) {
            result.push(this.cards[i]);
        }

        this.cards = [];
        return result;
    }

    setCamp(camp:PlayerCamp) {
        this.camp = camp;
    }
}

function showCardTable(cardTable: Array<CardTableItem>) {
    for (var i = 0; i < cardTable.length; ++i) {
        document.getElementById("cardTable").innerHTML += "<tr>\
          <td><input name='card_item_" + i + "' type='text' value='" + cardTable[i].card.name + "'/></td>\
          <td>\
          " + cardTypeSelect(cardTable[i].card) + "\
          </td>\
          <td><input name='' type='number' value='"+ cardTable[i].count + "'/></td>\
        </tr>";
    }
}

function cardTypeSelect(card: Card) {
    let result = "<select>";
    for (var i = 1; i < 4; ++i) {
        let selected = (card.type == i) ? "selected" : "";
        result += "<option value='" + i + "' " + selected + ">" + CardType[i] + "</option>";
    }

    result += "</select>";
    return result;
}

function getCards(cardTable: Array<CardTableItem>) {
    let cards: Array<Card> = [];

    for (var i = 0; i < cardTable.length; ++i) {
        let cardTableItem = cardTable[i];
        for (var j = 0; j < cardTableItem.count; j++) {
            cards.push(cardTableItem.card);
        }
    }

    return cards;
}

function updatePlayers() {
    let playerstrings = (<HTMLInputElement>document.getElementById("players")).value;
    let playerarray = playerstrings.split("\n");
    for (var i = playerarray.length - 1; i >= 0; i--) {
        if (playerarray[i] == "") {
            playerarray.slice(i, 1);
        }
    }
    if (playerarray.length == 7) {
        players = [];
        for (var i = 0; i < playerarray.length; i++) {
            players.push(new Player(playerarray[i]));
        }
    }
}

function randomArray(array) {
    return Math.floor(Math.random()*array.length);
}

function doing(outCount: number) {
    let tempCards = undefined;
    let tempPlayers = undefined;
    let blocktime = undefined;
    let abandonCards = undefined;
    let privilegeStrs = getCardOfType(cards, CardType.特权牌);

    while (true) {
        abandonCards = [];
        blocktime = 0;
        tempPlayers = [];
        tempCards = [];
        for (var i = cards.length - 1; i >= 0; i--) {
            tempCards.push(cards[i]);
        }
        for (var i = 0; i < players.length; i++) {
            tempPlayers.push(players[i]);
            players[i].clearCards();
        }

        //决定弃牌
        for (var i = 0; i < outCount; i++) {
            let card = undefined;
            let cardId = undefined;
            do {
                cardId = randomArray(tempCards);
                card = tempCards[cardId];
            } while (card.name == "杀手牌" || card.name == "狼人牌");
            abandonCards.push(card);
            tempCards.splice(cardId, 1);
        }

        // 庶民牌分发
        let waterCards = [];
        for (var i = tempCards.length - 1; i >= 0; i--) {
            if (tempCards[i].name == "庶民牌") {
                waterCards.push(tempCards[i]);
                tempCards.splice(i, 1);
            }
        }

        for (var i = players.length - 1; i >= 0; i--) {
            players[i].giveCard(waterCards.pop());
        }

        while (waterCards.length > 0) {
            let playerId = randomArray(tempPlayers);
            let player: Player = tempPlayers[playerId];
            if (player.cardCount("庶民牌") < 2) {
                player.giveCard(waterCards.pop());
            }
        }

        // 身份牌和特权牌
        let currentPID = 0;
        let blockCheck = false;
        while (tempCards.length > 0) {
            if (blocktime > BLOCK_TIMES) {
                blockCheck = true;
                console.log("发牌无解，重发");
                break;
            }
            let cardId = randomArray(tempCards);
            let card = tempCards[cardId];
            let player: Player = tempPlayers[currentPID];

            if (player.cards.length == 5) {
                currentPID ++;
                if (currentPID == tempPlayers.length) {
                    currentPID = 0;
                }
                continue;
            }

            if (card.name == "杀手牌") {
                if (player.hasCard("狼人牌")) {
                    blocktime++;
                    continue;
                }
            }

            if (card.name == "狼人牌") {
                if (player.hasCard("杀手牌")) {
                    blocktime++;
                    continue;
                }
            }

            let checkLimit = false;
            for (var i = privilegeStrs.length - 1; i >= 0; i--) {
                let privilege = privilegeStrs[i];
                if (card.name == privilege) {
                    if (player.hasCard(privilege)) {
                        checkLimit = true;
                        break;
                    }
                }
            }

            if (checkLimit) {
                blocktime ++;
                continue;
            }

            player.giveCard(card);
            tempCards.splice(cardId, 1);
            currentPID ++;
            if (currentPID == tempPlayers.length) {
                currentPID = 0;
            }
        }

        if (blockCheck) {
            continue;
        }

        //阵营判断
        let unknowPlay = [];
        for (var i = tempPlayers.length - 1; i >= 0; i--) {
            let player: Player = tempPlayers[i];
            if (player.hasCard("杀手牌")) {
                player.setCamp(PlayerCamp.杀手阵营);
            } else if (player.hasCard("狼人牌")) {
                player.setCamp(PlayerCamp.狼人阵营);
            } else {
                unknowPlay.push(player);
            }
        }

        let selectId:number = randomArray(unknowPlay);
        let selectPlayer : Player = unknowPlay[selectId];
        selectPlayer.setCamp(PlayerCamp.自选阵营);
        unknowPlay.splice(selectId, 1);

        for (var i = unknowPlay.length - 1; i >= 0; i--) {
            unknowPlay[i].setCamp(PlayerCamp.平民阵营);
        }

        break;
    }

    return { abandonCards: abandonCards, players: tempPlayers };
}

function getCardOfType(cards: Array<Card>, cardType: CardType) {
    let result:Array<string> = [];
    for (var i = 0; i < cards.length; i ++) {
        let card:Card = cards[i];
        if (card.type == cardType) {
            if (!(card.name in result)) {
                result.push(card.name);
            }
        }
    }
    return result;
}

function showPlayerTable(result) {
    document.getElementById("playerTable").innerHTML = "";
    for (var i = 0; i < result.players.length; ++i) {
        let player: Player = result.players[i];
        let cards: string = "";
        for (var j = player.cards.length - 1; j >= 0; j--) {
            cards += player.cards[j].name + " ";
        }
        document.getElementById("playerTable").innerHTML += "<tr>\
          <td>" + player.name + "</td>\
          <td>" + PlayerCamp[player.camp] + "</td>\
          <td>" + cards + "</td>\
        </tr>";
    }
    let outstring: string = ""
    for (var i = result.abandonCards.length - 1; i >= 0; i--) {
        outstring += result.abandonCards[i].name;
    }
    document.getElementById("playerTable").innerHTML += "<tr>\
          <td></td>\
          <td>弃牌</td>\
          <td>" + outstring + "</td>\
        </tr>";
}

function refresh() {
    updatePlayers();
    let result = doing(1);
    showPlayerTable(result);
}

refresh();
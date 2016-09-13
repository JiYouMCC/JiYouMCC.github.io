//最后一张特权发不出去重试次数为20次
var BLOCK_TIMES = 20;
var CardType;
(function (CardType) {
    CardType[CardType["身份牌"] = 1] = "身份牌";
    CardType[CardType["特权牌"] = 2] = "特权牌";
    CardType[CardType["庶民牌"] = 3] = "庶民牌";
})(CardType || (CardType = {}));
var PlayerCamp;
(function (PlayerCamp) {
    PlayerCamp[PlayerCamp["杀手阵营"] = 0] = "杀手阵营";
    PlayerCamp[PlayerCamp["狼人阵营"] = 1] = "狼人阵营";
    PlayerCamp[PlayerCamp["平民阵营"] = 2] = "平民阵营";
    PlayerCamp[PlayerCamp["自选阵营"] = 3] = "自选阵营";
    PlayerCamp[PlayerCamp["Unknow"] = 4] = "Unknow";
})(PlayerCamp || (PlayerCamp = {}));
var players = [];
var cardTable = [
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
var cards = getCards(cardTable);
var Player = (function () {
    function Player(playerName) {
        this.playerName = playerName;
        this.name = playerName;
        this.cards = [];
        this.camp = PlayerCamp.Unknow;
    }
    Player.prototype.hasCard = function (cardName) {
        for (var i = 0; i < this.cards.length; i++) {
            if (this.cards[i].name == cardName) {
                return true;
            }
        }
        return false;
    };
    Player.prototype.cardCount = function (cardName) {
        var result = 0;
        for (var i = 0; i < this.cards.length; i++) {
            if (this.cards[i].name == cardName) {
                result++;
            }
        }
        return result;
    };
    Player.prototype.giveCard = function (card) {
        this.cards.push(card);
    };
    Player.prototype.clearCards = function () {
        var result = [];
        for (var i = 0; i < this.cards.length; i++) {
            result.push(this.cards[i]);
        }
        this.cards = [];
        return result;
    };
    return Player;
}());
function showCardTable(cardTable) {
    for (var i = 0; i < cardTable.length; ++i) {
        document.getElementById("cardTable").innerHTML += "<tr>\
          <td><input name='card_item_" + i + "' type='text' value='" + cardTable[i].card.name + "'/></td>\
          <td>\
          " + cardTypeSelect(cardTable[i].card) + "\
          </td>\
          <td><input name='' type='number' value='" + cardTable[i].count + "'/></td>\
        </tr>";
    }
}
function cardTypeSelect(card) {
    var result = "<select>";
    for (var i = 1; i < 4; ++i) {
        var selected = (card.type == i) ? "selected" : "";
        result += "<option value='" + i + "' " + selected + ">" + CardType[i] + "</option>";
    }
    result += "</select>";
    return result;
}
function getCards(cardTable) {
    var cards = [];
    for (var i = 0; i < cardTable.length; ++i) {
        var cardTableItem = cardTable[i];
        for (var j = 0; j < cardTableItem.count; j++) {
            cards.push(cardTableItem.card);
        }
    }
    return cards;
}
function updatePlayers() {
    var playerstrings = document.getElementById("players").value;
    var playerarray = playerstrings.split("\n");
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
    var id = Math.floor(Math.random() * array.length);
    return id;
}
function doing(outCount) {
    var tempCards = undefined;
    var tempPlayers = undefined;
    var blocktime = undefined;
    var abandonCards = undefined;
    var privilegeStrs = getCardOfType(cards, CardType.特权牌);
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
            var card = undefined;
            var cardId = undefined;
            do {
                cardId = randomArray(tempCards);
                card = tempCards[cardId];
            } while (card.name == "杀手牌" || card.name == "狼人牌");
            abandonCards.push(card);
            tempCards.splice(cardId, 1);
        }
        //庶民牌
        var waterCards = [];
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
            var playerId = Math.floor(Math.random() * tempPlayers.length);
            var player = tempPlayers[playerId];
            if (player.cardCount("庶民牌") < 2) {
                player.giveCard(waterCards.pop());
            }
        }
        // 身份牌和特权牌
        var currentPID = 0;
        var blockCheck = false;
        while (tempCards.length > 0) {
            if (blocktime > BLOCK_TIMES) {
                blockCheck = true;
                console.log("发牌无解，重发");
                break;
            }
            var cardId = Math.floor(Math.random() * tempCards.length);
            var card = tempCards[cardId];
            var player = tempPlayers[currentPID];
            if (player.cards.length == 5) {
                currentPID++;
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
            var checkLimit = false;
            for (var i = privilegeStrs.length - 1; i >= 0; i--) {
                var privilege = privilegeStrs[i];
                if (card.name == privilege) {
                    if (player.hasCard(privilege)) {
                        checkLimit = true;
                        break;
                    }
                }
            }
            if (checkLimit) {
                blocktime++;
                continue;
            }
            player.giveCard(card);
            tempCards.splice(cardId, 1);
            currentPID++;
            if (currentPID == tempPlayers.length) {
                currentPID = 0;
            }
        }
        if (blockCheck) {
            continue;
        }
        //阵营判断
        var unknowPlay = [];
        for (var i = tempPlayers.length - 1; i >= 0; i--) {
            var player = tempPlayers[i];
            if (player.hasCard("杀手牌")) {
                player.camp = PlayerCamp.杀手阵营;
            }
            else if (player.hasCard("狼人牌")) {
                player.camp = PlayerCamp.狼人阵营;
            }
            else {
                unknowPlay.push(player);
            }
        }
        var sel = Math.floor(Math.random() * unknowPlay.length);
        var selplayer = unknowPlay[sel];
        selplayer.camp = PlayerCamp.自选阵营;
        unknowPlay.splice(sel, 1);
        for (var i = unknowPlay.length - 1; i >= 0; i--) {
            unknowPlay[i].camp = PlayerCamp.平民阵营;
        }
        break;
    }
    return { abandonCards: abandonCards, players: tempPlayers };
}
function getCardOfType(cards, cardType) {
    var result = [];
    for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
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
        var player = result.players[i];
        var cards_1 = "";
        for (var j = player.cards.length - 1; j >= 0; j--) {
            cards_1 += player.cards[j].name + " ";
        }
        document.getElementById("playerTable").innerHTML += "<tr>\
          <td>" + player.name + "</td>\
          <td>" + PlayerCamp[player.camp] + "</td>\
          <td>" + cards_1 + "</td>\
        </tr>";
    }
    var outstring = "";
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
    var result = doing(1);
    showPlayerTable(result);
}
refresh();

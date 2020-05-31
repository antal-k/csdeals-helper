const request = require('request');

module.exports = CSDeals;

function CSDeals(options) {
    this.cookies = options.cookies;
    this.headers = {
        'user-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.106 Safari/537.36',
        'referer': 'https://cs.deals/wallet',
        'Accept': '*/*',
        'Host': 'cs.deals',
    };
}
CSDeals.prototype.RequestBitcoin = function (amount, address) {
    return new Promise((resolve, reject) => {

        var options = {
            url: 'https://cs.deals/API/ICashout/RequestBitcoin/v1',
            method: 'POST',
            json: {
                "usd": amount,
                "address": address
            },
            headers: {
                Cookie: this.cookies,
                ...this.headers,
                'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'x-requested-with': 'XMLHttpRequest',
            },
        }

        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200 && body.success) {
                resolve(body.response.tx_hash);
            } else {
                if(body) {
                    reject(body.error);
                } else {
                    reject(false);
                }
            }
        });
    })
};
CSDeals.prototype.getLowestForItem = function (itemName, appId, lastPrice) {
    return new Promise((resolve, reject) => {

        var options = {
            url: 'https://cs.deals/ajax/marketplace-search',
            method: 'POST',
            body: `&name=${itemName}&appid=${appId}&sort=price&item_type=Wearable`,
            json: true,
            headers: {
                Cookie: this.cookies,
                ...this.headers,
                'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'x-requested-with': 'XMLHttpRequest',
            },
        }

        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200 && body.success) {
                if (Object.keys(body.response.results).length > 0 && body.response.results[appId].length > 0) {
                    body.response.results[appId].forEach( item => {
                        if(item.i !== lastPrice) {
                            resolve(item.i);
                        }
                    });
                } else {
                    reject(`Item ${itemName} not found.`);
                }
            } else {
                reject('Something went wrong.');
            }
        });
    })
};

CSDeals.prototype.refreshInventory = function (bypassCache = false) {
    return new Promise((resolve, reject) => {
        const options = {
            url: `https://cs.deals/ajax/userinventory?appid=0${bypassCache ? '&noc' : ''}`,
            method: 'POST',
            json: true,
            headers: {
                Cookie: this.cookies,
                ...this.headers,
                'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'x-requested-with': 'XMLHttpRequest',
            },
        }

        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200 && body.success) {
                resolve(true);
            } else {
                if(body && body.error) {
                    reject(body.error);
                }else{
                    console.log(error);
                    reject(false);
                }
            }
        });
    })
};
CSDeals.prototype.listItems = function (assets, appId) {
    return new Promise((resolve, reject) => {
        const items = [];
        assets.forEach( asset => {
            const outAssetIds = {};
            outAssetIds[asset.assetId] = 1;
            items.push(
                {
                    "appid": appId,
                    "assetids":outAssetIds,
                    "price": {
                        "real_money": {
                            "type": 0,
                            "price": asset.price
                        }
                    }
                });
        });
        const options = {
            url: 'https://cs.deals/API/ISales/ListItems/v1',
            method: 'POST',
            json: {
                "steam": items,
                "on_site": []
            },
            headers: {
                Cookie: this.cookies,
                ...this.headers,
                'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'x-requested-with': 'XMLHttpRequest',
            },
        }

        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200 && body.success) {
                resolve(true);
            } else {
                if(body) {
                    reject(body.error);
                }else{
                    reject(body);
                }
            }
        });
    })
};
CSDeals.prototype.listItem = function (assetId, appId, price) {
    return new Promise((resolve, reject) => {
        const assetids = {};
        assetids[assetId] = 1;
        const options = {
            url: 'https://cs.deals/API/ISales/ListItems/v1',
            method: 'POST',
            json: {
                "steam": [{
                    "appid": appId,
                    "assetids":assetids,
                    "price": {
                        "real_money": {
                            "type": 0,
                            "price": price
                        }
                    }
                }],
                "on_site": []
            },
            headers: {
                Cookie: this.cookies,
                ...this.headers,
                'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'x-requested-with': 'XMLHttpRequest',
            },
        }

        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200 && body.success) {
                resolve(true);
            } else {
                reject(body.error);
            }
        });
    })
};
CSDeals.prototype.getBalance = function () {
    return new Promise((resolve, reject) => {

        const options = {
            url: 'https://cs.deals/',
            method: 'GET',
            json: false,
            headers: {
                Cookie: this.cookies,
                ...this.headers,
            },
        }

        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                let regexp = /g_USDBalance = (.*);/g;
                let tmp = body.match(regexp);
                if (tmp && tmp[0]) {
                    const balance = tmp[0].replace('g_USDBalance = ', '').replace(';', '') * 1;
                    resolve(balance);
                } else {
                    reject('Something went wrong.');
                }
            } else {
                reject('Something went wrong.');
            }
        });
    })
};

CSDeals.prototype.getBTCRate = function () {
    return new Promise((resolve, reject) => {

        const options = {
            url: 'https://cs.deals/wallet',
            method: 'GET',
            json: false,
            headers: {
                Cookie: this.cookies,
                ...this.headers,
            },
        }

        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                let regexp = /g_BTCPrice=(.*);</g;
                let tmp = body.match(regexp);
                if (tmp && tmp[0]) {
                    const rate = tmp[0].replace('g_BTCPrice=', '').replace(';<', '') * 1;
                    resolve(rate);
                } else {
                    reject('Something went wrong.');
                }
            } else {
                reject('Something went wrong.');
            }
        });
    })
};
CSDeals.prototype.getListings = function () {
    return new Promise((resolve, reject) => {
        const options = {
            url: 'https://cs.deals/API/ISales/GetActiveListings/v1',
            method: 'POST',
            json: {
                "per_page": 200,
                "group": 1
            },
            headers: {
                Cookie: this.cookies,
                ...this.headers,
                'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'x-requested-with': 'XMLHttpRequest',
            },
        }

        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200 && body.success) {
                resolve(body.response.results);
            } else {
                if(body){
                    reject(body.error);
                }else{
                    reject('Unknown Error.');
                }
            }
        });
    })
};
CSDeals.prototype.editPrice = function (assetId, price) {
    return new Promise((resolve, reject) => {
        
        const options = {
            url: 'https://cs.deals/API/ISales/EditItems/v1',
            method: 'POST',
            json: {
                "items": [{
                    "on_site_item_id": assetId,
                    "price": {
                        "real_money": {
                            "type": 0,
                            "price": Math.round(price * 100) / 100
                        }
                    }
                }]
            },
            headers: {
                Cookie: this.cookies,
                ...this.headers,
                'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'x-requested-with': 'XMLHttpRequest',
            },
        }

        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200 && body.success) {
                resolve(true);
            } else {
                reject(body.error);
            }
        });
    })
};


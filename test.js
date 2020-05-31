const csdealsFactory = require('./csdeals.lib.js');

const CSDeals = new csdealsFactory({
    cookies: 'sessionID=abc123;'
});
const btcAddress = 'qwe123';

// get csdeals balance
CSDeals.getBalance().then( balance => {
    console.log(balance);
});

// get actual btc rate from csdeals
CSDeals.getBTCRate().then( rate => {
    console.log(rate);
});

// Auto BTC withdraw to csgoempire
const CSGOempireRate = 8900;
setInterval( () => {
    CSDeals.getBalance().then( balance => {
        if(balance > 15) {
            CSDeals.getBTCRate().then( rate => {
                // lower or equal to zero, no loss on btc deposit to csgoempire
                if(rate - CSGOempireRate < 0){
                    CSDeals.RequestBitcoin(balance, btcAddress).catch( err => {
                        console.log(`BTC error ${err}`);
                    });
                }
            }).catch( err => {
                console.log(err);
            });
        }
    }).catch( err => {
        console.log(err);
    });
}, 60 * 1000); // Every minute

CSDeals.getLowestForItem('Fractal Horns of Inner Abysm', 570, 18 /** last known price for this item */).then( price =>{
    console.log(`lowest price: ${price}`);
});

// listing item
CSDeals.refreshInventory(true).then( price =>{
    const items = [{
        assetId: '13245689', 
        price: 18,
    }]
    CSDeals.listItems(items, 570).then(status => {
        console.log('listing success');
    }).catch(err => {
        console.log(`listing error`);
    });
})
// get listing
CSDeals.getListings().then( listings => {
    console.log(listings); 
    /*
        sorry no structure
    */
});
// edit price
CSDeals.editPrice('1234567' /**csdeals asset id */, 18).then( status => {
    //
});
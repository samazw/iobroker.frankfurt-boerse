const utils = require('@iobroker/adapter-core');
const axios = require('axios');

class FrankfurtBoerse extends utils.Adapter {
    constructor(options) {
        super({ ...options, name: 'frankfurt-boerse' });
        this.on('ready', this.onReady.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

    async onReady() {
        const symbol = this.config.aktienAuswahl;
        const dpName = `kurs_${symbol.replace('.', '_')}`;

        // Datenpunkt automatisch erstellen
        await this.setObjectNotExistsAsync(dpName, {
            type: 'state',
            common: { name: `Kurs ${symbol}`, type: 'number', role: 'value.price', unit: 'EUR', read: true, write: false },
            native: {},
        });

        this.updateInterval = setInterval(() => this.fetchPrice(symbol, dpName), this.config.intervall * 60000);
        this.fetchPrice(symbol, dpName); // Erster Aufruf sofort
    }

    async fetchPrice(symbol, dpName) {
        try {
            const url = `https://yahoo.com{symbol}`;
            const response = await axios.get(url);
            const price = response.data.chart.result[0].meta.regularMarketPrice;
            this.setState(dpName, { val: price, ack: true });
            this.log.info(`Update für ${symbol}: ${price} EUR`);
        } catch (e) {
            this.log.error(`Fehler beim Abrufen von ${symbol}: ${e.message}`);
        }
    }

    onUnload(callback) {
        clearInterval(this.updateInterval);
        callback();
    }
}

if (require.main === module) {
    new FrankfurtBoerse();
} else {
    module.exports = FrankfurtBoerse;
}

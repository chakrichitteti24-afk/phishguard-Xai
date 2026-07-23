import asyncio
import aiohttp
import time

URLS = [
    "https://google.com", "https://github.com", "https://stackoverflow.com",
    "http://192.168.1.1/login", "https://paypal-update-account.com",
    "https://amazon.co.uk", "https://microsoft.com", "https://apple.com",
    "https://netflix.com", "https://youtube.com", "https://wikipedia.org",
    "https://yahoo.com", "https://whatsapp.com", "https://instagram.com",
    "https://reddit.com", "https://linkedin.com", "https://twitch.tv",
    "https://bing.com", "https://pinterest.com", "https://ebay.com",
    "https://wordpress.org", "https://zoom.us", "https://tiktok.com",
    "https://craigslist.org", "https://imdb.com", "https://aliexpress.com",
    "https://booking.com", "https://zillow.com", "https://hulu.com",
    "https://quora.com", "https://dropbox.com", "https://spotify.com",
    "https://vimeo.com", "https://etsy.com", "https://chase.com",
    "https://bankofamerica.com", "https://wellsfargo.com", "https://citi.com",
    "https://usbank.com", "https://capitalone.com", "https://discover.com",
    "https://americanexpress.com", "https://fidelity.com", "https://vanguard.com",
    "https://schwab.com", "https://tdameritrade.com", "https://robinhood.com",
    "https://coinbase.com", "https://binance.com", "https://kraken.com",
    "https://gemini.com", "https://ftx.com", "https://kucoin.com",
    "https://huobi.com", "https://okx.com", "https://bitfinex.com",
    "https://bitstamp.net", "https://poloniex.com", "https://bittrex.com",
    "https://gate.io", "https://mexc.com", "https://bybit.com",
    "https://phemex.com", "https://deribit.com", "https://bitmex.com",
    "https://dydx.exchange", "https://uniswap.org", "https://sushi.com",
    "https://pancakeswap.finance", "https://1inch.io", "https://curve.fi",
    "https://yearn.finance", "https://aave.com", "https://compound.finance",
    "https://makerdao.com", "https://synthetix.io", "https://balancer.fi",
    "https://bancor.network", "https://kyber.network", "https://loopring.org",
    "https://renproject.io", "https://thorchain.org", "https://cosmos.network",
    "https://polkadot.network", "https://kusama.network", "https://solana.com",
    "https://avalanche.network", "https://polygon.technology", "https://fantom.foundation",
    "https://harmony.one", "https://near.org", "https://algorand.com",
    "https://tezos.com", "https://cardano.org", "https://stellar.org",
    "https://ripple.com", "https://litecoin.org", "https://bitcoin.org",
    "https://ethereum.org", "https://dogecoin.com", "https://shibatoken.com"
]

URLS = URLS[:100]
assert len(URLS) == 100, f"Got {len(URLS)} URLs instead of 100"

async def test_url(session, url):
    payload = {"type": "URL", "payload": url}
    try:
        async with session.post("http://localhost:8000/api/v1/scan", json=payload) as response:
            status = response.status
            data = await response.json()
            return status, data.get('score', '?')
    except Exception as e:
        return 500, str(e)

async def main():
    print(f"Starting 100 concurrent tests...")
    start_time = time.time()
    
    async with aiohttp.ClientSession() as session:
        tasks = [test_url(session, url) for url in URLS]
        results = await asyncio.gather(*tasks)
        
    duration = time.time() - start_time
    
    success = 0
    failed = 0
    for status, _ in results:
        if status == 200:
            success += 1
        else:
            failed += 1
            
    print(f"Completed in {duration:.2f} seconds.")
    print(f"Success: {success}, Failed: {failed}")
    print(f"Average time per request (concurrent): {duration/len(URLS):.3f}s")

if __name__ == "__main__":
    asyncio.run(main())

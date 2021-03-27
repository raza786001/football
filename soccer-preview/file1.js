const { WebElement } = require('selenium-webdriver');
const { Builder, By, until } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const sharp = require('sharp');
const { cat, tempdir } = require('shelljs');
/** VARIABLES */
const websiteUrl = `https://soccer-preview.com/`;
var options = null;
var serviceBuilder = null;

async function init() {
    options = new firefox.Options();
    //uncomment for heroku
    serviceBuilder = new firefox.ServiceBuilder(process.env.GECKODRIVER_PATH);
    //comment for heroku
    //serviceBuilder = new firefox.ServiceBuilder();
    options.setBinary(process.env.FIREFOX_BIN);// || "C:\\Program Files\\Mozilla Firefox\\firefox.exe");
    options.headless();
    options.addArguments("--headless");
    options.addArguments("--disable-gpu");
    options.addArguments("--no-sandbox");
}

async function getSearchQueryResults(name) {
    console.log(`inside getSearchQueryResults()`);
    let driver = null;

    let result = [];
    try {
        driver = await new Builder().forBrowser('firefox')
            .setFirefoxOptions(options).setFirefoxService(serviceBuilder)
            .build();
        await driver.get(websiteUrl);
        await driver.wait(until.elementsLocated(By.className('index-header-menu-search')), 6000);
        let items = await driver.findElements(By.className('index-header-menu-search'));
        await items[0].click();

        await driver.executeScript(`document.getElementById("search-input").value = "${name}"`);
        await driver.executeScript(`document.getElementById("search-enter").click();`);

        await driver.wait(until.elementLocated(By.className('search-data-header search_bg')), 8000);
        players = await driver.findElements(By.className('row search-players-container'));

        let t = await players[0].findElements(By.className('search_border_bottom list_content text-left mobile_text'));
        let arr = [];
        let data = {};
        for (let q = 0; q < t.length; q++) {
            data = {};
            data['link'] = (await (await t[q].findElement(By.tagName('a'))).getAttribute('href'));
            data['name'] = ((await t[q].getText()));
            arr.push(data);
        }

        result = arr;
        return result;
    } catch (error) { console.log(error.message); return result; }
    finally { await driver.quit(); }
};

async function getInjuries(url) {
    console.log(`inside getSearchQueryResults()`);
    let driver = null;
    let result = {};
    try {
        driver = await new Builder().forBrowser('firefox')
            .setFirefoxOptions(options).setFirefoxService(serviceBuilder)
            .build();
        await driver.get(url + "#injuries");
        await driver.wait(until.elementsLocated(By.id('player_page_injuries_container')), 6000);
        let items = await driver.findElements(By.id('player_page_injuries_container'));
        //player_page_current_injuries_mobile_container
        try {
            await driver.wait(until.elementsLocated(By.id('player_page_current_injuries_mobile_container')), 6000);
            let current = await driver.findElements(By.id('player_page_current_injuries_mobile_container'));

            let listOfHistory1 = await current[0].findElements(By.className('col-xs-12 white_bg leagues_border_bottom list_content inview visible-inline'));
            let arr2 = [];
            for (let q = 0; q < (listOfHistory1).length; q++) {
                let e = await listOfHistory1[q].findElements(By.className("black"));
                //strong
                let f4 = "";
                let t7 = await listOfHistory1[q].findElements(By.className("strong"));
                f4 += await t7[0].getText() + "||"
                for (let q1 = 0; q1 < (e).length; q1++) {
                    let t26 = await e[q1].getText();

                    f4 += t26 + "||";

                }
                console.log(f4)
                arr2.push(f4);

            }
            result["currentInjuries"] = arr2;
        } catch (error) {

        }

        //player_page_historical_injuries_mobile_container
        try {
            await driver.wait(until.elementsLocated(By.id('player_page_historical_injuries_mobile_container')), 6000);
            let history = await driver.findElements(By.id('player_page_historical_injuries_mobile_container'));

            // console.log(await current[0].getText())
            // console.log(await history[0].getText())

            let listOfHistory = await history[0].findElements(By.className('col-xs-12 white_bg leagues_border_bottom list_content inview visible-inline'));
            let arr1 = [];
            for (let q = 0; q < (listOfHistory).length; q++) {
                let t1 = await listOfHistory[q].findElements(By.className("black"));
                //strong
                let f = "";
                let t3 = await listOfHistory[q].findElements(By.className("strong"));
                f += await t3[0].getText() + "||"
                for (let q1 = 0; q1 < (t1).length; q1++) {
                    let t2 = await t1[q1].getText();

                    f += t2 + "||";

                }
                console.log(f)
                arr1.push(f);

            }
            result["historyInjuries"] = arr1;
        } catch (error) {

        }
        console.log(result);
        return result;

    } catch (error) { console.log(error.message); return result; }
    finally { await driver.quit(); }
};

module.exports = {
    soccerPreviewInit: init,
    getSoccerPreviewSearchQueryResults: getSearchQueryResults,
    getSoccerPreviewInjuries: getInjuries
}

//getInjuries("https://soccer-preview.com/player/messias");
//getInformation("https://www.footballcritic.com/lionel-messi/profile/5663");
//getSearchClubQueryResults("RCD Espanyol Barcelona")
//getListOfDetailedPlayers("https://www.transfermarkt.com/rcd-espanyol-barcelona/kader/verein/714/saison_id/2020");
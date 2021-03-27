const { WebElement } = require('selenium-webdriver');
const { Builder, By, until } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const sharp = require('sharp');
const { cat, tempdir } = require('shelljs');
/** VARIABLES */
const websiteUrl = `https://int.soccerway.com/`;
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
        await driver.get(websiteUrl + "search/?q=" + name + "&module=all");
        await driver.wait(until.elementsLocated(By.id('page_search_1_block_search_results_players_5')), 6000);
        let items = await driver.findElements(By.id('page_search_1_block_search_results_players_5'));

        let table = await items[0].findElements(By.tagName('table'));
        let tbody = await table[0].findElements(By.tagName('tbody'));
        let rows = await tbody[0].findElements(By.tagName('tr'));
        for (let q = 0; q < rows.length; q++) {
            let player = await rows[q].findElement(By.className("player"));
            let a = await player.findElement(By.tagName('a'))
            let href = await a.getAttribute('href')
            let data = {};
            data['link'] = href;
            data['name'] = await player.getText();
            result.push(data);
        }

        console.log(result)
        return result;
    } catch (error) { console.log(error.message); return result; }
    finally { await driver.quit(); }
};

async function getSidelined(url) {
    console.log(`inside getSidelined()`);
    let driver = null;

    let result = [];
    try {
        driver = await new Builder().forBrowser('firefox')
            .setFirefoxOptions(options).setFirefoxService(serviceBuilder)
            .build();
        await driver.get(url);
        await driver.wait(until.elementsLocated(By.id('page_player_1_block_player_sidelined_9-wrapper')), 6000);
        let items = await driver.findElements(By.id('page_player_1_block_player_sidelined_9-wrapper'));

        let table = await items[0].findElements(By.tagName('table'));
        let tbody = await table[0].findElements(By.tagName('tbody'));
        let rows = await tbody[0].findElements(By.tagName('tr'));
        for (let q = 1; q < rows.length; q++) {
            let data = {};
            let cols = await rows[q].findElements(By.tagName('td'));
            data["description"] = (await cols[1].getText());
            data["startDate"] = (await cols[2].getText());
            data["endDate"] = (await cols[3].getText());
            result.push(data);
        }
        return result;
    } catch (error) { console.log(error.message); return result; }
    finally { await driver.quit(); }
};

module.exports = {
    soccerwayInit: init,
    getSoccerwaySearchQueryResults: getSearchQueryResults,
    getSoccerwaySideLined: getSidelined
}

//block  clearfix block_player_sidelined-wrapper body-table header-wrapper
//getSidelined("https://int.soccerway.com/players/lionel-andres-messi/119/");
//getInjuries("https://soccer-preview.com/player/messias");
//getInformation("https://www.footballcritic.com/lionel-messi/profile/5663");
//getSearchClubQueryResults("RCD Espanyol Barcelona")
//getListOfDetailedPlayers("https://www.transfermarkt.com/rcd-espanyol-barcelona/kader/verein/714/saison_id/2020");
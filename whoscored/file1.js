const { Builder, By, until } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const sharp = require('sharp');
const { cat } = require('shelljs');
/** VARIABLES */
const websiteUrl = `https://1xbet.whoscored.com/`;
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
        await driver.get(websiteUrl + "Search/?t=" + name);
        await driver.wait(until.elementsLocated(By.className('search-result')), 6000);
        let items = await driver.findElements(By.className('search-result'));
        let table = await items[0].findElement(By.tagName('table'));

        let tableBody = await table.findElements(By.tagName('tbody'));

        let rows = await tableBody[0].findElements(By.tagName('tr'));
        console.log(rows.length);
        for (let q = 1; q < rows.length; q++) {
            let data = {};
            let cols = await rows[q].findElements(By.tagName('td'))
            let a = await cols[0].findElement(By.tagName('a'));
            data['link'] = await a.getAttribute('href');
            data['name'] = await a.getText();
            result.push(data);
        }
        console.log(result);
        return result;
    } catch (error) { console.log(error.message); }
    finally { await driver.quit(); }
};

async function getInformation(url) {
    console.log(`inside getInformation()`);
    var result = {};
    let driver = null;
    try {
        driver = await new Builder().forBrowser('firefox')
            .setFirefoxOptions(options).setFirefoxService(serviceBuilder)
            .build();
        await driver.get(url);
        await driver.wait(until.elementLocated(By.className('strengths')), 6000);
        const strengths = (await driver.findElements(By.className('strengths')));
        // strengths
        let grid = await strengths[0].findElement(By.className('grid'));
        let characters = await grid.findElements(By.className('character'));
        let strengthData = [];
        for (var q = 0; q < (characters).length; q++) {
            let divs = await characters[q].findElements(By.tagName('div'));
            let o = {};
            console.log(await divs[0].getText());
            o['name'] = await divs[0].getText();
            console.log(await divs[1].getText());
            o['strength'] = await divs[1].getText();
            strengthData.push(o);
            console.log("-------------------------------------")
        }
        result['strengths'] = strengthData;

        // weaknesses
        const weaknesses = (await driver.findElements(By.className('weaknesses')));
        let grid1 = await weaknesses[0].findElement(By.className('grid'));
        let characters1 = await grid1.findElements(By.className('character'));
        let weaknessData = [];
        for (var q = 0; q < (characters1).length; q++) {
            let divs1 = await characters1[q].findElements(By.tagName('div'));
            let o1 = {};
            console.log(await divs1[0].getText());
            o1['name'] = await divs1[0].getText();
            console.log(await divs1[1].getText());
            o1['weakness'] = await divs1[1].getText();
            weaknessData.push(o1);
            console.log("-------------------------------------")
        }
        result['weaknesses'] = weaknessData;

        // style play
        const style = (await driver.findElements(By.className('style')));
        let characters2 = await style[0].findElements(By.className('character'));
        let styleData = [];
        for (var q = 0; q < (characters2).length; q++) {
            let divs2 = await characters2[q].findElements(By.tagName('div'));
            let o2 = {};
            console.log(await divs2[0].getText());
            o2['name'] = await divs2[0].getText();
            styleData.push(o2);
            console.log("-------------------------------------")
        }
        result['style'] = styleData;

        console.log(result);
        return result;
    } catch (error) {
        console.log(`error: `, error);
        return result;
    }
    finally {
        try { await driver.quit(); } catch (error) {
            console.log(`error: `, error);
        }
    }
};


async function getLastMatchesAndOverallRatings(url) {
    console.log(`inside getLastMatchesAndOverallRatings()`);
    var result = {};
    let driver = null;
    try {
        driver = await new Builder().forBrowser('firefox')
            .setFirefoxOptions(options).setFirefoxService(serviceBuilder)
            .build();
        await driver.get(url);
        await driver.wait(until.elementLocated(By.id('player-matches-table')), 6000);
        const playerMatches = (await driver.findElements(By.id('player-matches-table')));
        // matches
        let tableBody = await playerMatches[0].findElement(By.className('table-body'));
        let rows = await tableBody.findElements(By.className('divtable-row'));
        let matches = []
        for (var q = 0; q < (rows).length; q++) {
            if (q < 5) {
                console.log(await rows[q].getText());
                matches.push(await rows[q].getText());
                console.log("-------------------------------------")
            } else {
                break;
            }
        }
        result['matches'] = matches;

        await driver.wait(until.elementLocated(By.id('statistics-table-summary')), 6000);
        const tournaments = (await driver.findElements(By.id('statistics-table-summary')));
        let str = await tournaments[0].getText();
        let arr = str.split(" ");
        result["overallRating"] = str.split(" ")[arr.length - 1];
        return result;
    } catch (error) {
        console.log(`error: `, error);
        return result;
    }
    finally {
        try { await driver.quit(); } catch (error) {
            console.log(`error: `, error);
        }
    }
};

module.exports = {
    getwhoscoredSearchQueryResults: getSearchQueryResults,
    whoscoredInit: init,
    getwhoscoredInformation: getInformation,
    getwhoscoredLastMatchesAndOverallRatings: getLastMatchesAndOverallRatings
}

//getLastMatchesAndOverallRatings("https://1xbet.whoscored.com/Players/11119/Show/Lionel-Messi");
//getInformation("https://www.footballcritic.com/lionel-messi/profile/5663");
//getSearchClubQueryResults("RCD Espanyol Barcelona")
//getListOfDetailedPlayers("https://www.transfermarkt.com/rcd-espanyol-barcelona/kader/verein/714/saison_id/2020");
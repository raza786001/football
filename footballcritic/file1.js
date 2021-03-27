const { Builder, By, until } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const sharp = require('sharp');
const { cat } = require('shelljs');
/** VARIABLES */
const websiteUrl = `https://www.footballcritic.com/`;
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
        await driver.get(websiteUrl + "search?q=" + name);
        await driver.wait(until.elementsLocated(By.className('stats-table teamMatches players')), 6000);
        let items = await driver.findElements(By.className('stats-table teamMatches players'));
        let tableBody = await items[0].findElements(By.tagName('tbody'));

        let rows = await tableBody[0].findElements(By.tagName('tr'));
        for (let q = 0; q < rows.length; q++) {
            let data = {};
            let cols = await rows[q].findElements(By.tagName('td'))
            let a = await cols[1].findElement(By.tagName('a'));
            data['link'] = await a.getAttribute('href');
            data['name'] = await a.getText();
            result.push(data);
        }
        return result;
    } catch (error) { return error.message; }
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
        await driver.wait(until.elementLocated(By.className('league-information')), 6000);
        const infoSection = (await driver.findElements(By.className('league-information')));
        let ul = await infoSection[0].findElements(By.tagName('ul'));
        let li = await ul[0].findElements(By.tagName('li'));
        try {
            for (let q = 0; q < li.length; q++) {
                let span = await li[q].findElements(By.tagName('span'));
                let title = await li[q].findElements(By.tagName('strong'));
                result[`${await title[0].getAttribute('innerText')}`] =
                    await span[0].getAttribute('innerText');
            }

        } catch (error) {

        }
        let table = await driver.findElements(By.className('stats-table player'));
        let tbody = await table[0].findElements(By.tagName('tbody'));
        let rows = await tbody[0].findElements(By.tagName('tr'));
        let matches = [];
        for (let q1 = 0; q1 < rows.length; q1++) {
            try {
                if (q1 < 5) {
                    let cols = await rows[q1].findElements(By.tagName('td'));
                    let match = {};
                    try {
                        match['Comp'] = await cols[0].getText();
                        match['Date'] = await cols[1].getText();
                        try {
                            match['form_ico'] = await cols[2].getText();
                        } catch (error) {
                            match['form_ico'] = ''
                        }
                        try {
                            let o = '';
                            let div = await cols[3].findElement(By.className('match-box'));
                            let teamName = await div.findElement(By.className('team-name'));
                            let a = await teamName.findElement(By.tagName('a'));
                            let text = await a.getText();
                            o += text;

                            let img = await div.findElement(By.className('img'));
                            let a1 = await img.findElement(By.tagName('a'));
                            let src = await a1.getAttribute('href');
                            o += "||" + src;

                            let a2 = await div.findElement(By.className('btn-info'));
                            let text1 = await a2.getAttribute('innerText');
                            o += "||" + text1;

                            let teamName1 = await div.findElements(By.className('team-name'));
                            let a3 = await teamName1[1].findElement(By.tagName('a'));
                            let text2 = await a3.getText();
                            o += "||" + text2;

                            let img1 = await div.findElements(By.className('img'));
                            let a4 = await img1[1].findElement(By.tagName('a'));
                            let src1 = await a4.getAttribute('href');
                            o += "||" + src1;

                            match['Fixture'] = o;

                        } catch (error) {
                            match['Fixture'] = ''
                        }

                        try {
                            match['Mins'] = await cols[5].getText();
                        } catch (error) {
                            match['Mins'] = '';
                        }
                        try {
                            match['Ratings'] = await cols[6].getText();
                        } catch (error) {
                            match['Ratings'] = '';
                        }

                        matches.push(match);
                    } catch (error) {

                    }
                } else {
                    break;
                }
                // let ratings = await rows[q1].findElements(By.className('ratings'));
                // let rating = await ratings[0].findElement(By.className('rating'));
                // let text = await rating.getText();
                // matches.push(text);
            } catch (error) {

            }
        }
        result['matches'] = matches;
        await driver.wait(until.elementLocated(By.id('seasonStats')), 6000);
        let seasonStats = await driver.findElements(By.id('seasonStats'));
        let seasonTable = await seasonStats[0].findElements(By.tagName('table'));
        let seasonTableBody = await seasonTable[0].findElement(By.tagName('tbody'));
        let seasonTableRows = await seasonTableBody.findElements(By.tagName('tr'));
        let overallRatingFound = false;
        for (let q2 = seasonTableRows.length - 1; q2 >= 0; q2--) {
            try {
                let seasonTableCols = await seasonTableRows[q2].findElements(By.tagName('td'));
                for (let q3 = 0; q3 < seasonTableCols.length; q3++) {
                    try {
                        let divOfRating = await seasonTableCols[q3].findElement(By.tagName('div'));
                        result['rating'] = await divOfRating.getText();
                        overallRatingFound = true;
                        break;
                    } catch (error) {

                    }
                }
                if (overallRatingFound) { break; } else { result['rating'] = '' }
            } catch (error) {

            }
        }
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
async function getEightPointTable(url) {
    console.log(`inside getEightPointTable()`);
    var res = { 'eightPointTable': null };
    let driver = null;
    try {
        driver = await new Builder().forBrowser('firefox')
            .setFirefoxOptions(options).setFirefoxService(serviceBuilder)
            .build();
        await driver.get(url);
        try {
            //JS-PLAYER-PENTAGON
            await driver.wait(until.elementsLocated(By.id('chartdiv_radar')), 8000);
            const t = await driver.findElement(By.id('chartdiv_radar'))
            await driver.wait(until.elementsLocated(By.tagName('svg')), 10000);
            let svg = await t.findElement(By.tagName('svg'));
            var h = (await svg.getRect());
            console.log('params: ', h);

            await driver.executeScript(`document.getElementById('header').hidden = true`);
            //await driver.executeScript(`document.getElementById('div-gpt-ad-1582536504312-0').hidden = true`);

            await driver.executeScript(`window.scrollTo(${h.x}, ${h.y})`)

            var base64Image = null;
            await driver.takeScreenshot(true).then(
                function (image, err) {
                    base64Image = Buffer.from(image, 'base64');
                });
            await sharp(base64Image).extract({
                width: Math.round(h.width), height:
                    Math.round(h.height), left: Math.round(h.x), top: 0
            }).toBuffer()
                .then(function (new_file_info) {
                    res['img'] = Buffer.from(new_file_info).toString('base64')
                })
                .catch(function (err) {
                    console.log("error: " + err);
                });

        } catch (error) {
            console.log(`error: `, error);
        }
        console.log(`result: `, res);
        return res;

    } catch (error) { console.log(error.message); return res; }
    finally {
        try { await driver.quit(); } catch (error) {
            console.log(`error: `, error);
        }
    }
};

module.exports = {
    getfotballCriticSearchQueryResults: getSearchQueryResults,
    fotballCriticInit: init,
    getfotballCriticInformation: getInformation,
    getfotballCriticPointTable: getEightPointTable
}

//console.log(getSearchQueryResults("messi"));
//getInformation("https://www.footballcritic.com/lionel-messi/profile/5663");
//getSearchClubQueryResults("RCD Espanyol Barcelona")
//getListOfDetailedPlayers("https://www.transfermarkt.com/rcd-espanyol-barcelona/kader/verein/714/saison_id/2020");
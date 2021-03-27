const { Builder, By, until } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');

/** VARIABLES */
const websiteUrl = `https://www.fotmob.com/`;
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
        await driver.wait(until.elementsLocated(By.className('css-e2xxx6-SearchParticipantsResultsCSS e1tesw9t0')), 6000);
        let items = await driver.findElements(By.className('css-e2xxx6-SearchParticipantsResultsCSS e1tesw9t0'));

        let h3 = await items[0].findElement(By.tagName('h3'));
        let h3Text = await h3.getText();
        if (h3Text.indexOf('Players') >= 0) {
            let aTag = await items[0].findElements(By.tagName('a'));
            for (let q = 0; q < aTag.length; q++) {
                let data = {};
                data['link'] = await aTag[q].getAttribute('href');
                data['name'] = await (await aTag[q].findElement(By.tagName('span'))).getText();
                result.push(data);
            }
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
        await driver.wait(until.elementLocated(By.className('css-ml92fx-PlayerInfoSectionCSS')), 6000);
        result['image'] = await (await driver.findElements(By.className('PlayerIcon')))[0].getAttribute('src');
        const infoSection = (await driver.findElements(By.className('css-ml92fx-PlayerInfoSectionCSS')))[0];
        let stats = await infoSection.findElements(By.className('css-1ykdtkq-singleStatContainer'));
        for (let q = 0; q < stats.length; q++) {
            let spans = await stats[q].findElements(By.tagName('span'));
            result[`${await spans[0].getAttribute('innerText')}`] =
                await spans[1].getAttribute('innerText');
        }
        await driver.wait(until.elementLocated(By.className('css-j177x9-PlayerCareerMainLeagueSectionCSS')), 6000);
        const CareerInfoSection = (await driver.findElements(By.className('css-j177x9-PlayerCareerMainLeagueSectionCSS')))[0];
        let stats1 = await CareerInfoSection.findElements(By.className('css-1k66dwc-statsContainer'));
        let statsData = await stats1[0].findElements(By.className('css-cvjoby-statBox'));
        for (let q1 = 0; q1 < statsData.length; q1++) {
            let spans1 = await statsData[q1].findElements(By.tagName('span'));
            result[`${await spans1[0].getAttribute('innerText')}`] =
                await spans1[1].getAttribute('innerText');
        }

        const RatingInfoSection = (await driver.findElements(By.className('css-u3hym5-PlayerTableMatchStatsBlockCSS')))[0];
        let aList = await RatingInfoSection.findElements(By.tagName('a'));
        let matches = [];

        await driver.wait(until.elementsLocated(By.className('css-vpbgrc-scoreWrapper')), 6000);
        for (let q2 = 0; q2 < aList.length; q2++) {
            let match = {};
            if (q2 < 5) {
                let cols = await aList[q2].findElements(By.tagName('span'));
                match['Date'] = await cols[0].getText();
                match['https://www.fotmob.com/static/dist/img/9848ea526e4fc5a3c27c3372cc57958c.svg'] = await cols[6].getText();
                match['https://www.fotmob.com/static/dist/img/685ee264a9d34013ab9ce1f047508bc5.svg'] = await cols[7].getText();
                match['https://www.fotmob.com/static/dist/img/e8b1ad92f339b51a7947bc7d5648aff5.svg'] = await cols[8].getText();
                match['https://www.fotmob.com/static/dist/img/92fe0bb2a3f4e3ca8bfaa7ed0a0faf8f.svg'] = await cols[9].getText();
                match['https://www.fotmob.com/static/dist/img/d97783f37b0fd308ae88f6bc25a73352.svg'] = await cols[10].getText();
                match['https://www.fotmob.com/static/dist/img/d055e4770a8aaa8149bf1b6b41a4bf70.svg'] = await cols[11].getText();


                await driver.wait(until.elementLocated(By.className('css-u3hym5-PlayerTableMatchStatsBlockCSS')), 6000);
                let vs = await aList[q2].findElements(By.className('css-vpbgrc-scoreWrapper'));
                let img = await vs[0].findElements(By.tagName('img'));
                try {
                    let src = await img[0].getAttribute('src');
                    //match['VsImage'] = src;
                } catch (error) {
                    //match['VsImage'] = '';
                }
                match['Vs'] = await vs[0].getText();
                matches.push(match);
            } else {
                break;
            }
        }
        result['matches'] = matches;
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
    getFotmobSearchQueryResults: getSearchQueryResults,
    fotmobInit: init,
    getFotmobInformation: getInformation
}

//getSearchQueryResults("messi");
//getSearchClubQueryResults("RCD Espanyol Barcelona")
//getListOfDetailedPlayers("https://www.transfermarkt.com/rcd-espanyol-barcelona/kader/verein/714/saison_id/2020");
const sharp = require('sharp');
const { Builder, By, until } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');

/** VARIABLES */
const sofaScoreWebsiteUrl = `https://www.sofascore.com/`;
var options = null;
var serviceBuilder = null;

async function init() {
    options = new firefox.Options();
    //uncomment for heroku
    serviceBuilder = new firefox.ServiceBuilder(process.env.GECKODRIVER_PATH);
    //comment for heroku
    //serviceBuilder = new firefox.ServiceBuilder();
    options.setBinary(process.env.FIREFOX_BIN)// || "C:\\Program Files\\Mozilla Firefox\\firefox.exe");
    options.headless();
    options.addArguments("--headless");
    options.addArguments("--disable-gpu");
    options.addArguments("--no-sandbox");
}

async function getSearchQueryResults(name) {
    console.log(`inside getSearchQueryResults()`);
    let driver = null;
    try {
        driver = await new Builder().forBrowser('firefox')
            .setFirefoxOptions(options).setFirefoxService(serviceBuilder)
            .build();
        await driver.get(sofaScoreWebsiteUrl + "search?q=" + name);
        await driver.wait(until.elementsLocated(By.className('SearchResultsStyles__SearchEntitiesWrapper-zw2msy-5 kuenVF')), 12000);
        const divs = await driver.findElements(By.className('SearchResultsStyles__SearchEntitiesWrapper-zw2msy-5 kuenVF'));
        let res = [];
        for (var i = 0; i < divs.length; i++) {
            var r = await divs[i].getText();
            if (r.indexOf('Football') == 0) {
                var arr = await divs[i].findElements(By.tagName('a'));
                var ind = 0;
                do {
                    var f = {};
                    try {
                        var l = await arr[ind].getAttribute('href');
                        if (l != null || l != 'null' || l != undefined) {
                            if (l.indexOf('player') > 0) {
                                f['url'] = l;
                                f['name'] = ''
                                try {
                                    var name = await arr[ind].getText();
                                    f['name'] = name
                                } catch (error) {
                                    console.log('error: ', error.message);
                                };
                                res.push(f);
                            }
                        }
                    } catch (err) {
                        console.log('error: ', err)
                    }
                    ind++;
                } while (ind < arr.length)
            }
        }
        return res;
    } catch (error) { return error.message; }
    finally { await driver.quit(); }
};

async function getPositionMap(url) {
    console.log(`inside getPositionMap()`);
    var res = { 'positionTerrain': null };
    let driver = null;
    try {
        driver = await new Builder().forBrowser('firefox')
            .setFirefoxOptions(options).setFirefoxService(serviceBuilder)
            .build();
        await driver.get(url);
        try {
            //player-pos-map__terrain
            await driver.wait(until.elementLocated(By.className('styles__TerrainWrapper-sc-1xzi2p0-2 kdaLfM')), 12000);
            const t = (await driver.findElement(By.className('styles__TerrainWrapper-sc-1xzi2p0-2 kdaLfM')));
            var h = (await t.getRect());
            console.log('params : ', h)
            await driver.executeScript(`window.scrollTo(${h.x}, ${h.y})`)
            var base64Image = null;
            await driver.takeScreenshot(true).then(
                function (image, err) {
                    base64Image = Buffer.from(image, 'base64');
                })
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
        } console.log(`result: `, res);
        return res;

    } catch (error) { console.log(error.message); return res; }
    finally {
        try { await driver.quit(); } catch (error) {
            console.log(`error: `, error);
        }
    }
};

async function getStrengthAndWeakness(url) {
    console.log(`inside getStrengthAndWeakness()`);
    var res = { 'strengths': null, 'weaknesses': null };
    let driver = null;
    try {
        driver = await new Builder().forBrowser('firefox')
            .setFirefoxOptions(options).setFirefoxService(serviceBuilder)
            .build();
        await driver.get(url);
        try {
            await driver.wait(until.elementLocated(By.className('Cell-decync-0 fhgviz u-pH16')), 10000)
            const body = await (await driver.findElement(By.className('Cell-decync-0 fhgviz u-pH16'))).getText();
            var sW = body.split("\n");
            try {
                if (sW[0] == 'Strengths') {
                    res['strengths'] = sW[1]
                }
            } catch (error) {
                console.log('error: ', error)
            }
            try {
                if (sW[2] == 'Weaknesses') {
                    res['weaknesses'] = sW[3]
                }
            } catch (error) {
                console.log('error: ', error)
            }
        } catch (error) {
            console.log(`error: `, error);
        }
        console.log(`result: `, res);
        return res;

    } catch (error) {
        console.log(error.message); return res;
    }
    finally {
        try { await driver.quit(); } catch (error) {
            console.log(`error: `, error);
        }
    }
}

async function getPentagonMap(url) {
    console.log(`inside getPentagonMap()`);
    var res = { 'pentagon': null };
    let driver = null;
    try {
        driver = await new Builder().forBrowser('firefox')
            .setFirefoxOptions(options).setFirefoxService(serviceBuilder)
            .build();
        await driver.get(url);
        try {

            //JS-PLAYER-PENTAGON
            await driver.wait(until.elementLocated(By.className('styles__PentagonContainer-sc-1n6byml-4 hWYSDE')), 12000);
            const t = await driver.findElement(By.className('styles__PentagonContainer-sc-1n6byml-4 hWYSDE'));
            var h = (await t.getRect());
            console.log('params: ', h)
            await driver.executeScript(`window.scrollTo(${h.x}, ${h.y})`)
            var base64Image = null;
            await driver.takeScreenshot(true).then(
                function (image, err) {
                    base64Image = Buffer.from(image, 'base64');

                })
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

async function getSessionHeatMap(url) {
    console.log(`inside getSessionHeatMap()`);
    var res = { 'sessionHeatMap': null };
    let driver = null;
    try {
        driver = await new Builder().forBrowser('firefox')
            .setFirefoxOptions(options).setFirefoxService(serviceBuilder)
            .build();
        await driver.get(url);
        try {
            //JS-PLAYER-PENTAGON
            await driver.wait(until.elementsLocated(By.className('styles__HeatmapPanel-xy9xvq-0 knhzWz')), 6000);
            const t = await driver.findElement(By.className('styles__HeatmapPanel-xy9xvq-0 knhzWz'))
            var h = (await t.getRect());
            console.log('params: ', h);
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

async function getPersonalInfo(url) {
    var res = { 'personalDetails': null };
    let driver = null;
    try {
        driver = await new Builder().forBrowser('firefox')
            .setFirefoxOptions(options).setFirefoxService(serviceBuilder)
            .build();
        await driver.get(url);
        try {
            await driver.wait(until.elementLocated(By.className(`Cell-decync-0 fBCxDu`)), 1000)
            var t = await (await driver.findElement(By.className(`Cell-decync-0 fBCxDu`))).getText();
            console.log(`terrain: `, t);
            var o = {};
            var q = t.split("\n")
            try {
                o['nationality'] = q[0];
                o['ranking'] = q[2];
                o['birthDate'] = q[3];
                o['height'] = q[4];
                o['prefferedFootStyle'] = q[6];
                o['position'] = q[8];
                o['shirtNumber'] = q[10];
                res['personalDetails'] = o;
            } catch (error) {
                res.personalDetails = t;
            }

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

async function getAverageRating(url) {
    var res = { 'averageRating': null };
    let driver = null;
    try {
        driver = await new Builder().forBrowser('firefox')
            .setFirefoxOptions(options).setFirefoxService(serviceBuilder)
            .build();
        await driver.get(url);
        try {
            await driver.wait(until.elementLocated(By.className(`styles__AverageRating-sc-10aftp2-7 efNxrN`)), 10000)
            var t = await (await driver.findElement(By.className(`styles__AverageRating-sc-10aftp2-7 efNxrN`))).getText();
            res.averageRating = t;
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

async function getValue(url) {
    var res = { 'value': null };
    let driver = null;
    try {
        driver = await new Builder().forBrowser('firefox')
            .setFirefoxOptions(options).setFirefoxService(serviceBuilder)
            .build();
        await driver.get(url);
        try {
            await driver.wait(until.elementLocated(By.className('styles__AmountSection-sc-1gt648e-1 kmpQaH')), 10000)
            var t = await (await driver.findElement(By.className(`styles__AmountSection-sc-1gt648e-1 kmpQaH`))).getText();
            res.value = t;

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

async function getMatchesStatistics(url) {
    var res = {};
    let driver = null;
    try {
        driver = await new Builder().forBrowser('firefox')
            .setFirefoxOptions(options).setFirefoxService(serviceBuilder)
            .build();
        await driver.get(url);
        try {
            await driver.wait(until.elementsLocated(By.className('styles__Container-sc-1ktw8nr-4 hWllse')), 12000);
            const t = await driver.findElement(By.className('styles__Container-sc-1ktw8nr-4 hWllse'))
            const headers = await t.findElements(By.tagName('h4'))
            const tables = await t.findElements(By.tagName('div'))
            var ind = 0;
            for (var j = 0; j < headers.length; j++) {
                if (await headers[j].getText() == "Matches") {
                    ind = j;
                    break;
                }
            }
            var h = await (await driver.findElements(By.className('styles__AccordionContentWrapper-sc-1ktw8nr-0 iChUwx')))[ind].getRect();
            var o = await tables[ind].findElement(By.tagName('table'));
            var trs = await o.findElements(By.tagName("tr"))
            for (var j = 0; j < trs.length; j++) {

                var fw = await trs[j].getText();
                if (fw.indexOf('Show more') >= 0) {
                    var s =
                        `document.getElementsByClassName('styles__Container-sc-1ktw8nr-4 hWllse')[0].getElementsByTagName('table')[${ind}].getElementsByClassName('styles__ShowMoreTd-sc-1ktw8nr-7 kdxQtN')[0].click()`;
                    await driver.executeScript('return ' + s);
                    h = await (await driver.findElements(By.className('styles__AccordionContentWrapper-sc-1ktw8nr-0 iChUwx')))[ind].getRect();
                    break
                }

            }
            console.log('params: ', h)
            await driver.executeScript(`window.scrollTo(${h.x}, ${h.y})`)
            var base64Image = null;
            await driver.takeScreenshot(true).then(
                function (image, err) {
                    base64Image = Buffer.from(image, 'base64');
                })
            await sharp(base64Image).extract({
                width: Math.round(h.width), height:
                    Math.round(h.height), left: Math.round(h.x), top: 0
            }).toBuffer()
                .then(function (new_file_info) {
                    res['image'] = Buffer.from(new_file_info).toString('base64')

                })
                .catch(function (err) {
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

async function getAttackingStatistics(url) {
    var res = {};
    let driver = null;
    try {
        driver = await new Builder().forBrowser('firefox')
            .setFirefoxOptions(options).setFirefoxService(serviceBuilder)
            .build();
        await driver.get(url);
        try {
            await driver.wait(until.elementsLocated(By.className('styles__Container-sc-1ktw8nr-4 hWllse')), 10000);
            const t = await driver.findElement(By.className('styles__Container-sc-1ktw8nr-4 hWllse'))
            const headers = await t.findElements(By.tagName('h4'))
            const tables = await t.findElements(By.tagName('div'))
            var ind = 0;
            for (var j = 0; j < headers.length; j++) {
                if (await headers[j].getText() == "Attacking") {
                    ind = j;
                    break;
                }
            }
            var h = await (await driver.findElements(By.className('styles__AccordionContentWrapper-sc-1ktw8nr-0 iChUwx')))[ind].getRect();
            var o = await tables[ind].findElement(By.tagName('table'));
            var trs = await o.findElements(By.tagName("tr"))
            for (var j = 0; j < trs.length; j++) {

                var fw = await trs[j].getText();
                if (fw.indexOf('Show more') >= 0) {
                    var s =
                        `document.getElementsByClassName('styles__Container-sc-1ktw8nr-4 hWllse')[0].getElementsByTagName('table')[${ind}].getElementsByClassName('styles__ShowMoreTd-sc-1ktw8nr-7 kdxQtN')[0].click()`;
                    await driver.executeScript('return ' + s);
                    h = await (await driver.findElements(By.className('styles__AccordionContentWrapper-sc-1ktw8nr-0 iChUwx')))[ind].getRect();
                    break
                }

            }
            console.log('params: ', h)
            await driver.executeScript(`window.scrollTo(${h.x}, ${h.y})`)
            var base64Image = null;
            await driver.takeScreenshot(true).then(
                function (image, err) {
                    base64Image = Buffer.from(image, 'base64');
                })
            await sharp(base64Image).extract({
                width: Math.round(h.width), height:
                    Math.round(h.height), left: Math.round(h.x), top: 0
            }).toBuffer()
                .then(function (new_file_info) {
                    res['image'] = Buffer.from(new_file_info).toString('base64')

                })
                .catch(function (err) {
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

async function getPassingStatistics(url) {
    var res = {};
    let driver = null;
    try {
        driver = await new Builder().forBrowser('firefox')
            .setFirefoxOptions(options).setFirefoxService(serviceBuilder)
            .build();
        await driver.get(url);
        try {
            await driver.wait(until.elementsLocated(By.className('styles__Container-sc-1ktw8nr-4 hWllse')), 10000);
            const t = await driver.findElement(By.className('styles__Container-sc-1ktw8nr-4 hWllse'))
            const headers = await t.findElements(By.tagName('h4'))
            const tables = await t.findElements(By.tagName('div'))
            var ind = 0;
            for (var j = 0; j < headers.length; j++) {
                if (await headers[j].getText() == "Passing") {
                    ind = j;
                    break;
                }
            }
            var h = await (await driver.findElements(By.className('styles__AccordionContentWrapper-sc-1ktw8nr-0 iChUwx')))[ind].getRect();
            var o = await tables[ind].findElement(By.tagName('table'));
            var trs = await o.findElements(By.tagName("tr"))
            for (var j = 0; j < trs.length; j++) {

                var fw = await trs[j].getText();
                if (fw.indexOf('Show more') >= 0) {
                    var s =
                        `document.getElementsByClassName('styles__Container-sc-1ktw8nr-4 hWllse')[0].getElementsByTagName('table')[${ind}].getElementsByClassName('styles__ShowMoreTd-sc-1ktw8nr-7 kdxQtN')[0].click()`;
                    await driver.executeScript('return ' + s);
                    h = await (await driver.findElements(By.className('styles__AccordionContentWrapper-sc-1ktw8nr-0 iChUwx')))[ind].getRect();
                    break
                }

            }
            console.log('params: ', h)
            await driver.executeScript(`window.scrollTo(${h.x}, ${h.y})`)
            var base64Image = null;
            await driver.takeScreenshot(true).then(
                function (image, err) {
                    console.log(1)
                    base64Image = Buffer.from(image, 'base64');
                });
            await sharp(base64Image).extract({
                width: Math.round(h.width), height:
                    Math.round(h.height), left: Math.round(h.x), top: 0
            }).toBuffer()
                .then(function (new_file_info) {
                    res['image'] = Buffer.from(new_file_info).toString('base64')
                })
                .catch(function (err) {
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

async function getDefendingStatistics(url) {
    var res = {};
    let driver = null;
    try {
        driver = await new Builder().forBrowser('firefox')
            .setFirefoxOptions(options).setFirefoxService(serviceBuilder)
            .build();
        await driver.get(url);
        try {
            await driver.wait(until.elementsLocated(By.className('styles__Container-sc-1ktw8nr-4 hWllse')), 10000);
            const t = await driver.findElement(By.className('styles__Container-sc-1ktw8nr-4 hWllse'))
            const headers = await t.findElements(By.tagName('h4'))
            const tables = await t.findElements(By.tagName('div'))
            var ind = 0;
            for (var j = 0; j < headers.length; j++) {
                if (await headers[j].getText() == "Defending") {
                    ind = j;
                    break;
                }
            }
            var h = await (await driver.findElements(By.className('styles__AccordionContentWrapper-sc-1ktw8nr-0 iChUwx')))[ind].getRect();
            var o = await tables[ind].findElement(By.tagName('table'));
            var trs = await o.findElements(By.tagName("tr"))
            for (var j = 0; j < trs.length; j++) {

                var fw = await trs[j].getText();
                if (fw.indexOf('Show more') >= 0) {
                    var s =
                        `document.getElementsByClassName('styles__Container-sc-1ktw8nr-4 hWllse')[0].getElementsByTagName('table')[${ind}].getElementsByClassName('styles__ShowMoreTd-sc-1ktw8nr-7 kdxQtN')[0].click()`;
                    await driver.executeScript('return ' + s);
                    h = await (await driver.findElements(By.className('styles__AccordionContentWrapper-sc-1ktw8nr-0 iChUwx')))[ind].getRect();
                    break
                }

            }
            console.log('params: ', h)
            await driver.executeScript(`window.scrollTo(${h.x}, ${h.y})`)
            var base64Image = null;
            await driver.takeScreenshot(true).then(
                function (image, err) {
                    base64Image = Buffer.from(image, 'base64');
                })
            await sharp(base64Image).extract({
                width: Math.round(h.width), height:
                    Math.round(h.height), left: Math.round(h.x), top: 0
            }).toBuffer()
                .then(function (new_file_info) {
                    res['image'] = Buffer.from(new_file_info).toString('base64')
                })
                .catch(function (err) {
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

async function getOtherStatistics(url) {
    var res = {};
    let driver = null;
    try {
        driver = await new Builder().forBrowser('firefox')
            .setFirefoxOptions(options).setFirefoxService(serviceBuilder)
            .build();
        await driver.get(url);
        try {
            await driver.wait(until.elementsLocated(By.className('styles__Container-sc-1ktw8nr-4 hWllse'), 12000));
            const t = await driver.findElement(By.className('styles__Container-sc-1ktw8nr-4 hWllse'))
            const headers = await t.findElements(By.tagName('h4'))
            const tables = await t.findElements(By.tagName('div'))
            var ind = 0;
            for (var j = 0; j < headers.length; j++) {
                if (await headers[j].getText() == "Other") {
                    ind = j;
                    break;
                }
            }
            var h = await (await driver.findElements(By.className('styles__AccordionContentWrapper-sc-1ktw8nr-0 iChUwx')))[ind].getRect();
            var o = await tables[ind].findElement(By.tagName('table'));
            var trs = await o.findElements(By.tagName("tr"))
            for (var j = 0; j < trs.length; j++) {

                var fw = await trs[j].getText();
                if (fw.indexOf('Show more') >= 0) {
                    var s =
                        `document.getElementsByClassName('styles__Container-sc-1ktw8nr-4 hWllse')[0].getElementsByTagName('table')[${ind}].getElementsByClassName('styles__ShowMoreTd-sc-1ktw8nr-7 kdxQtN')[0].click()`;
                    await driver.executeScript('return ' + s);
                    h = await (await driver.findElements(By.className('styles__AccordionContentWrapper-sc-1ktw8nr-0 iChUwx')))[ind].getRect();
                    break
                }

            }
            console.log('params: ', h)
            await driver.executeScript(`window.scrollTo(${h.x}, ${h.y})`)
            var base64Image = null;
            await driver.takeScreenshot(true).then(
                function (image, err) {
                    base64Image = Buffer.from(image, 'base64');
                })
            await sharp(base64Image).extract({
                width: Math.round(h.width), height:
                    Math.round(h.height), left: Math.round(h.x), top: 0
            }).toBuffer()
                .then(function (new_file_info) {
                    res['image'] = Buffer.from(new_file_info).toString('base64')
                })
                .catch(function (err) {
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

async function getCardsStatistics(url) {
    console.log(`inside getCardsStatistics()`);
    var res = {};
    let driver = null;
    try {
        driver = await new Builder().forBrowser('firefox')
            .setFirefoxOptions(options).setFirefoxService(serviceBuilder)
            .build();
        await driver.get(url);
        try {
            await driver.wait(until.elementsLocated(By.className('styles__Container-sc-1ktw8nr-4 hWllse')), 12000);
            const t = await driver.findElement(By.className('styles__Container-sc-1ktw8nr-4 hWllse'))
            const headers = await t.findElements(By.tagName('h4'))
            const tables = await t.findElements(By.tagName('div'))
            var ind = 0;
            for (var j = 0; j < headers.length; j++) {
                if (await headers[j].getText() == "Cards") {
                    ind = j;
                    break;
                }
            }
            var h = await (await driver.findElements(By.className('styles__AccordionContentWrapper-sc-1ktw8nr-0 iChUwx')))[ind].getRect();
            var o = await tables[ind].findElement(By.tagName('table'));
            var trs = await o.findElements(By.tagName("tr"))
            for (var j = 0; j < trs.length; j++) {
                var fw = await trs[j].getText();
                if (fw.indexOf('Show more') >= 0) {
                    var s =
                        `document.getElementsByClassName('styles__Container-sc-1ktw8nr-4 hWllse')[0].getElementsByTagName('table')[${ind}].getElementsByClassName('styles__ShowMoreTd-sc-1ktw8nr-7 kdxQtN')[0].click()`;
                    await driver.executeScript('return ' + s);
                    h = await (await driver.findElements(By.className('styles__AccordionContentWrapper-sc-1ktw8nr-0 iChUwx')))[ind].getRect();
                    break
                }

            }
            console.log('params: ', h)
            await driver.executeScript(`window.scrollTo(${h.x}, ${h.y})`)
            var base64Image = null;
            await driver.takeScreenshot(true).then(
                function (image, err) {
                    base64Image = Buffer.from(image, 'base64');

                })
            await sharp(base64Image).extract({
                width: Math.round(h.width), height:
                    Math.round(h.height), left: Math.round(h.x), top: 0
            }).toBuffer()
                .then(function (new_file_info) {
                    res['image'] = Buffer.from(new_file_info).toString('base64')
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

async function getLastMatchesRatings(url) {
    console.log(`inside getLastMatchesRatings()`);
    var res = { "lastMatchesRatings": [] };
    let driver = null;
    try {
        driver = await new Builder().forBrowser('firefox')
            .setFirefoxOptions(options).setFirefoxService(serviceBuilder)
            .build();
        await driver.get(url);
        try {
            //JS-PLAYER-PENTAGON
            await driver.wait(until.elementsLocated(By.className('styles__EventListContent-b3g57w-2 dotAOs')), 12000);
            const t = await driver.findElement(By.className('styles__EventListContent-b3g57w-2 dotAOs'))
            var s =
                `document.getElementsByClassName('styles__EventListContent-b3g57w-2 dotAOs')[0].getElementsByClassName('EventCellstyles__Link-sc-1m83enb-0 dhKVQJ')`
            var c = await driver.executeScript('return ' + s);
            driver.wait(until.elementsLocated(By.className('EventCellstyles__TailActionLink-sc-1m83enb-3 hBXDOH')))
            for (var w = 0; w < c.length; w++) {
                var r = await c[w].findElement(By.className('EventCellstyles__TailActionLink-sc-1m83enb-3 hBXDOH')).getText();
                res['lastMatchesRatings'].push(r);
            }
            return res;
        } catch (error) { console.log('error: ' + error.message); return res; }

    } catch (error) { console.log('error: ' + error.message); return res; }
    finally {
        try { await driver.quit(); } catch (error) {
            console.log(`error: `, error);
        }
    }
};

module.exports = {
    getSearchQueryResults: getSearchQueryResults,
    init: init,
    getStrengthAndWeakness: getStrengthAndWeakness,
    getPositionMap: getPositionMap,
    getPentagonMap: getPentagonMap,
    getSessionHeatMap: getSessionHeatMap,
    getPersonalInfo: getPersonalInfo,
    getAverageRating: getAverageRating,
    getValue: getValue,
    getMatchesStatistics: getMatchesStatistics,
    getAttackingStatistics: getAttackingStatistics,
    getPassingStatistics: getPassingStatistics,
    getDefendingStatistics: getDefendingStatistics,
    getCardsStatistics: getCardsStatistics,
    getOtherStatistics: getOtherStatistics,
    getLastMatchesRatings: getLastMatchesRatings
}




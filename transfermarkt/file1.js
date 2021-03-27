const sharp = require('sharp');
const { Builder, By, until } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const { cat } = require('shelljs');

/** VARIABLES */
const transfermarktWebsiteUrl = `https://www.transfermarkt.com/`;
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
        await driver.get(transfermarktWebsiteUrl + "schnellsuche/ergebnis/schnellsuche?query=" + name);
        await driver.wait(until.elementsLocated(By.className('items')), 12000);
        let items = await driver.findElements(By.className('items'));
        let tbody = (await items[0].findElements(By.tagName('tbody')))[0];
        let tables = await tbody.findElements(By.tagName('table'));
        for (var i = 0; i < tables.length; i++) {
            try {
                let arr = await tables[i].findElements(By.tagName('td'));
                let href = await (await arr[1].findElements(By.tagName('a')))[0].getAttribute('href');
                let name = await (await arr[1].findElements(By.tagName('a')))[0].getAttribute('innerText');
                var temp = {};
                temp['name'] = name;
                temp['link'] = href;
                result.push(temp);
            } catch (error) {

            }
        }
        return result;
    } catch (error) { return error.message; }
    finally { await driver.quit(); }
};

async function getSearchClubQueryResults(name) {
    console.log(`inside getSearchClubQueryResults()`);
    let driver = null;
    let result = { "clubs": [] };
    try {
        driver = await new Builder().forBrowser('firefox')
            .setFirefoxOptions(options).setFirefoxService(serviceBuilder)
            .build();
        await driver.get(transfermarktWebsiteUrl + "schnellsuche/ergebnis/schnellsuche?query=" + name);
        await driver.wait(until.elementsLocated(By.className('items')), 12000);
        let items = await driver.findElements(By.className('box'));
        for (var i = 0; i < items.length; i++) {
            try {
                let header = await items[i].findElement(By.className('table-header'));
                let text = await header.getText();
                if (text.indexOf("CLUBS") > 0 || text.indexOf("Clubs") > 0) {
                    console.log(i);
                    const body = await items[i].findElement(By.tagName('tbody'));
                    const rows = await body.findElements(By.tagName('tr'));
                    var len = (await (await body.findElements(By.xpath(`//*[@id="yw${i}"]/table/tbody/tr`))).length);
                    for (var j = 0; j < len; j++) {
                        if (j < 3) {
                            var o = j + 1;
                            var col = await rows[j].findElement(By.xpath(`//*[@id="yw${i}"]/table/tbody/tr[${o}]`));
                            console.log(await col.getText());
                            let temp = {};
                            let imgTag = await col.findElement(By.tagName("img"));//.getAttribute('a');
                            let imageSrc = await imgTag.getAttribute("src");
                            temp["clubImage"] = imageSrc;
                            let href = (await col.findElement(By.className("hauptlink")))//.getAttribute('a');
                            let text = await href.getText();
                            temp["club"] = text;
                            let href1 = (await (await href.findElement(By.tagName("a"))).getAttribute("href"));
                            // console.log(href1);
                            temp["link"] = href1;
                            result["clubs"].push(temp);
                        } else {
                            break;
                        }
                    }
                    break;
                }
                // var temp = {};
                // temp['name'] = name;
                // temp['link'] = href;
                // result.push(temp);
            } catch (error) {

            }
        }
        //console.log(result)
        return result;
    } catch (error) { return error.message; }
    finally { await driver.quit(); }
};

// async function getSearchQueryResultsClubs(name) {
//     console.log(`inside getSearchQueryResultsClubs()`);
//     let driver = null;
//     let result = [];
//     try {
//         driver = await new Builder().forBrowser('firefox')
//             .setFirefoxOptions(options).setFirefoxService(serviceBuilder)
//             .build();
//         await driver.get(transfermarktWebsiteUrl + "schnellsuche/ergebnis/schnellsuche?query=" + name);
//         await driver.wait(until.elementsLocated(By.xpath('//*[@id="yw5"]/table')), 12000);
//         let items = await driver.findElements(By.xpath('//*[@id="yw5"]/table'));

//         return result;
//     } catch (error) { return error.message; }
//     finally { await driver.quit(); }
// };


async function getInformation(url) {
    console.log(`inside getInformation()`);
    var res = {
        rank: null,
        data: {}
    };
    let driver = null;
    try {
        driver = await new Builder().forBrowser('firefox')
            .setFirefoxOptions(options).setFirefoxService(serviceBuilder)
            .build();
        await driver.get(url);
        await driver.wait(until.elementLocated(By.className('dataHeader dataExtended')), 6000);
        const div = (await driver.findElements(By.className('dataHeader dataExtended')))[0];
        const details = await div.findElements(By.className('dataContent'));
        const ps = await details[0].findElements(By.tagName('p'));



        for (var j = 0; j < ps.length; j++) {
            let spans = await ps[j].findElements(By.tagName('span'));
            try {
                res[`${await spans[0].getAttribute('innerText')}`] = await spans[1].getAttribute('innerText')
            } catch (error) {

            }
        }

        try {
            let rankspan = (await driver.findElements(By.className('dataName')));
            console.log(rankspan.length)
            res['rank'] = await (await rankspan[0].findElements(By.tagName('span')))[0].getAttribute('innerText');
        } catch (error) {
            console.log('error: ', error)
        }

        try {
            let divs = (await driver.findElements(By.className('dataZusatzbox')));
            console.log(divs.length)
            let imageClass = await divs[0].findElements(By.className('dataZusatzImage'));
            let image = await imageClass[0].findElement(By.tagName("img"));
            let src = await image.getAttribute("src");
            res['playerImageUrl'] = src;
            let divs1 = (await divs[0].findElements(By.className('dataZusatzDaten')));
            let spans = (await divs1[0].findElements(By.tagName('span')));
            console.log(spans.length)
            for (var i = 0; i < spans.length; i++) {
                let spanText = await spans[i].getAttribute('innerText');
                let w = i + 1;
                if (spanText == "League level:") {
                    res[`${spanText}`] = await spans[w].getAttribute('innerText');
                } else if (spanText == "Joined:") {
                    res[`${spanText}`] = await spans[w].getAttribute('innerText');
                } else if (spanText == "Contract until:") {
                    res[`${spanText}`] = await spans[w].getAttribute('innerText');
                } else if (spanText == "country:") {
                    res[`${spanText}`] = await spans[w].getAttribute('innerText');
                }
            }

        } catch (error) {
            console.log('error: ', error)
        }

        try {
            let divs = (await driver.findElements(By.className('dataMarktwert')));
            res['value'] = (await (await divs[0].findElements(By.tagName('a')))[0].getAttribute('innerText'))
        } catch (error) {
            console.log('error: ', error)
        }

        try {
            let divs = (await driver.findElements(By.className('auflistung')));
            console.log(':: ' + divs.length)
            let trs = (await divs[divs.length - 1].findElements(By.tagName('tr')));
            console.log(':: ' + trs.length)
            for (var i = 0; i < trs.length; i++) {
                let spanText = await trs[i].getAttribute('innerText');
                console.log(spanText);
                try {
                    res.data["" + `${spanText.split(":")[0]}` + ""] = spanText.split(":")[1].replace('\t', '');
                } catch (error) {

                }
            }

        } catch (error) {
            console.log('error: ', error)
        }



        return res;
    } catch (error) {

    }
    finally {
        try { await driver.quit(); } catch (error) {
            console.log(`error: `, error);
        }
    }
};

async function getTransferHistory(url) {
    console.log(`inside getTransferHistory()`);
    var res = {};
    let driver = null;
    try {
        driver = await new Builder().forBrowser('firefox')
            .setFirefoxOptions(options).setFirefoxService(serviceBuilder)
            .build();
        await driver.get(url);
        try {
            await driver.wait(until.elementsLocated(By.className('box transferhistorie viewport-tracking')), 12000);
            const t = await driver.findElement(By.className('box transferhistorie viewport-tracking'))
            // await driver.wait(until.elementsLocated(By.className('subkategorie-header')), 12000);
            //const t1 = await t.findElement(By.className('subkategorie-header'));

            const table = await t.findElement(By.className('responsive-table'));
            const t2 = await table.findElement(By.tagName('table'));
            const head = await t2.findElement(By.tagName('thead'));
            console.log(await head.getAttribute('innerHTML'))
            const body = await t2.findElement(By.tagName('tbody'));
            const foot = await t2.findElement(By.tagName('tfoot'));

            const trs = await head.findElements(By.tagName('tr'));
            console.log(await trs[0].getAttribute('innerHTML'))
            const ths = await trs[0].findElements(By.tagName('th'));
            console.log(ths.length)
            let temp = [];
            for (var k = 0; k < ths.length; k++) {

                temp.push(await ths[k].getAttribute('innerText'))
                // try {
                //     console.log(await ths[k].getAttribute('colspan'));
                //     let count = parseInt(await (await ths[k].getAttribute('colspan')).toString());
                //     for (var u = 0; u < count; u++) {
                //         console.log(u + ":" + await ths[k].getAttribute('innerText'));
                //         temp.push(await ths[k].getAttribute('innerText'))
                //     }

                // } catch (error) {
                //     console.log('error: ' + error.message);
                //     console.log(await ths[k].getAttribute('innerText'));
                //     temp.push(await ths[k].getAttribute('innerText'))
                // }
            }
            res['tableHead'] = temp;

            const trs1 = await body.findElements(By.tagName('tr'));
            // images
            // let images = [];
            // for (var q = 0; q < trs1.length; q++) {
            //     const tds = await trs1[q].findElements(By.tagName('td'));
            //     for (var w = 0; w < tds.length; w++) {
            //         let imgs = await tds[w].findElements(By.tagName('img'));
            //         for (var p = 0; p < imgs.length; p++) {
            //             let img = await imgs[p].getAttribute('src');
            //             let club = await imgs[p].getAttribute('alt');
            //             images.push({
            //                 imageLink: img,
            //                 clubName: club
            //             })
            //         }
            //     }
            // }
            // res['imagesOfClubs'] = images;
            //


            let row11 = [];
            for (var j = 0; j < trs1.length; j++) {
                const ths1 = await trs1[j].findElements(By.tagName('td'));
                let temp1 = [];
                for (var k = 0; k < ths1.length; k++) {
                    if (k == 2 || k == 3 || k == 5 || k == 6) {

                    } else {
                        temp1.push(await ths1[k].getAttribute('innerText'));
                    }
                    // try {
                    //     let imgs = await ths1[k].findElements(By.tagName('img'));
                    //     let col = await imgs[0].getAttribute('src');
                    //     console.log(col);
                    //     temp1.push(col);
                    //     col = await imgs[1].getAttribute('src');
                    //     temp1.push(col);
                    //     let val = await ths1[k].findElement(By.className('hauptlink no-border-links vereinsname'));
                    //     temp1.push(await val.getAttribute('innerText'))
                    // } catch (error) {
                    //     console.log('error: ' + error.message);
                    //     console.log(await ths1[k].getAttribute('innerText'));
                    //     temp1.push(await ths1[k].getAttribute('innerText'))
                    // }
                }
                row11.push(temp1);
            }
            res['tableBody'] = row11;

            const trs2 = await foot.findElements(By.tagName('tr'));
            console.log(await trs2[0].getAttribute('innerHTML'))
            const ths2 = await trs2[0].findElements(By.tagName('td'));
            console.log(ths2.length)
            let temp2 = [];
            for (var k = 0; k < ths2.length; k++) {

                temp2.push(await ths2[k].getAttribute('innerText'))
                // try {
                //     console.log(await ths[k].getAttribute('colspan'));
                //     let count = parseInt(await (await ths[k].getAttribute('colspan')).toString());
                //     for (var u = 0; u < count; u++) {
                //         console.log(u + ":" + await ths[k].getAttribute('innerText'));
                //         temp.push(await ths[k].getAttribute('innerText'))
                //     }

                // } catch (error) {
                //     console.log('error: ' + error.message);
                //     console.log(await ths[k].getAttribute('innerText'));
                //     temp.push(await ths[k].getAttribute('innerText'))
                // }
            }
            res['tableFoot'] = temp2;
            // let transfers = [];
            // for (var i = 0; i < trs.length; i++) {
            //     if (i == 0) {
            //         let ths = await trs[i].findElements(By.tagName('th'));
            //         var row1 = [];
            //         for (var j = 0; j < ths.length; j++) {
            //             let col = await ths[j].getAttribute('innerText');
            //             row1.push(col);
            //         }
            //         transfers.push(row1);
            //     } else {
            //         let ths = await trs[i].findElements(By.tagName('td'));
            //         var row1 = [];
            //         for (var j = 0; j < ths.length; j++) {

            //             let col = await ths[j].getAttribute('innerText');
            //             if (col != "") {
            //                 row1.push(col);
            //             }

            //         }
            //         transfers.push(row1);
            //     }
            //     // console.log(await trs[i].getAttribute('innerText'))
            // }
            // res['transfers'] = transfers;

            // var h = await t2.getRect();
            // console.log('params: ', h)
            // await driver.executeScript('document.getElementsByClassName(`subnavi_box`)[0].hidden = true;')
            // await driver.executeScript('document.getElementsByClassName(`large-12 columns megamenu_container megamenu_dark_bar megamenu_dark`)[0].hidden = true;')
            // await driver.wait(until.elementsLocated(By.name('google_ads_iframe_/58778164/TM_Desktop_Skyscraper_300x600_0')));
            // await driver.executeScript('document.getElementsByName(`google_ads_iframe_/58778164/TM_Desktop_Skyscraper_300x600_0`)[0].hidden = true;')

            // await driver.executeScript(`window.scrollTo(0, 0)`)
            // await driver.executeScript(`window.scrollTo(${h.x}, ${h.y})`)

            // var base64Image = null;
            // await driver.takeScreenshot(true).then(
            //     function (image, err) {
            //         base64Image = Buffer.from(image, 'base64');
            //         //res['image'] = image;

            //     })
            // await sharp(base64Image).extract({
            //     width: Math.round(h.width), height:
            //         Math.round(h.height), left: Math.round(h.x), top: 0
            // }).toBuffer()
            //     .then(function (new_file_info) {
            //         res['image'] = Buffer.from(new_file_info).toString('base64')
            //     })
            //     .catch(function (err) {
            //         console.log("error: " + err);
            //     });

        } catch (error) {
            console.log(`error: `, error);
        }
        return res;

    } catch (error) { console.log(error.message); return res; }
    finally {
        try { await driver.quit(); } catch (error) {
            console.log(`error: `, error);
        }
    }
};

async function getDetailedStatisticsUrl(url) {
    var res = {};
    let driver = null;
    try {
        driver = await new Builder().forBrowser('firefox')
            .setFirefoxOptions(options).setFirefoxService(serviceBuilder)
            .build();
        await driver.get(url);
        try {
            await driver.wait(until.elementsLocated(By.className('c2action-footer')), 10000);
            const t1 = await driver.findElements(By.className('c2action-footer'))
            const href = await (await t1[1].findElement(By.tagName('a'))).getAttribute('href');
            //await driver.get(href.replace("leistungsdaten", "leistungsdatendetails") + "//verein/0/liga/0/wettbewerb//pos/0/trainer_id/0/plus/1");
            let url1 = href.replace("leistungsdaten", "leistungsdatendetails") + "//verein/0/liga/0/wettbewerb//pos/0/trainer_id/0/plus/1";

            res['url'] = url1;

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
}

async function getStatistics2021(url) {
    var res = {};
    let driver = null;
    try {
        driver = await new Builder().forBrowser('firefox')
            .setFirefoxOptions(options).setFirefoxService(serviceBuilder)
            .build();
        await driver.get(url);
        try {
            // await driver.wait(until.elementsLocated(By.className('c2action-footer')), 10000);
            // const t1 = await driver.findElements(By.className('c2action-footer'))
            // const href = await (await t1[1].findElement(By.tagName('a'))).getAttribute('href');
            // await driver.get(href.replace("leistungsdaten", "leistungsdatendetails") + "//verein/0/liga/0/wettbewerb//pos/0/trainer_id/0/plus/1");
            // console.log(href.replace("leistungsdaten", "leistungsdatendetails") + "//verein/0/liga/0/wettbewerb//pos/0/trainer_id/0/plus/1");

            await driver.wait(until.elementsLocated(By.className('box')), 5000);
            const t = await driver.findElements(By.className('box'))
            const table = await t[0].findElement(By.className('responsive-table'));
            const t2 = await table.findElement(By.tagName('table'));

            const head = await t2.findElement(By.tagName('thead'));
            const body = await t2.findElement(By.tagName('tbody'));
            const foot = await t2.findElement(By.tagName('tfoot'));

            const trs = await head.findElements(By.tagName('tr'));
            // console.log(await trs[0].getAttribute('innerText'));
            // let ths = await (await (await t2.findElement(By.tagName('thead'))).findElement('tr')).findElements('th');
            let ths = await trs[0].findElements(By.tagName('th'));
            var row1 = [];
            for (var j = 0; j < ths.length; j++) {
                try {
                    let span = await ths[j].findElement(By.tagName('span'));
                    let col = await span.getAttribute('title');
                    row1.push(col);
                } catch (error) {
                    console.log('error: ' + error);
                    let col = await ths[j].getAttribute('innerText');
                    row1.push(col);
                }
            }

            res['tableHead'] = row1;

            const trs1 = await body.findElements(By.tagName('tr'));
            // console.log(await trs[0].getAttribute('innerText'));
            // let ths = await (await (await t2.findElement(By.tagName('thead'))).findElement('tr')).findElements('th');
            var row11 = [];
            for (var i = 0; i < trs1.length; i++) {
                let ths1 = await trs1[i].findElements(By.tagName('td'));
                var row1 = [];

                for (var j = 0; j < ths1.length; j++) {

                    if (j == 3) {
                        try {
                            let span = await ths1[j].findElement(By.tagName('img'));
                            let col = await span.getAttribute('src');
                            row1.push(col);
                        } catch (error) {
                            console.log('error: ' + error);
                            let col = await ths1[j].getAttribute('innerText');
                            row1.push(col);
                        }
                    } else {
                        let col = await ths1[j].getAttribute('innerText');
                        row1.push(col);
                    }
                }
                row11.push(row1);
            }

            res['tableBody'] = row11;

            const trs2 = await foot.findElements(By.tagName('tr'));
            // console.log(await trs[0].getAttribute('innerText'));
            // let ths = await (await (await t2.findElement(By.tagName('thead'))).findElement('tr')).findElements('th');
            let ths2 = await trs2[0].findElements(By.tagName('td'));
            var row1 = [];
            for (var j = 0; j < ths2.length; j++) {
                let col = await ths2[j].getAttribute('innerText');
                row1.push(col);

                // try {
                //     let span = await ths2[j].findElement(By.tagName('span'));
                //     let col = await span.getAttribute('title');
                //     row1.push(col);
                // } catch (error) {
                //     console.log('error: ' + error);
                //     let col = await ths2[j].getAttribute('innerText');
                //     if (j == 1) {

                //     } else {
                //         row1.push(col);
                //     }
                // }
            }

            res['tableFoot'] = row1;

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

async function getStatisticsTableHead(url) {
    var res = {};
    let driver = null;
    try {
        driver = await new Builder().forBrowser('firefox')
            .setFirefoxOptions(options).setFirefoxService(serviceBuilder)
            .build();
        await driver.get(url);
        try {
            await driver.wait(until.elementsLocated(By.className('box')), 5000);
            const t = await driver.findElements(By.className('box'))
            const table = await t[0].findElement(By.className('responsive-table'));
            const t2 = await table.findElement(By.tagName('table'));

            const head = await t2.findElement(By.tagName('thead'));

            const trs = await head.findElements(By.tagName('tr'));
            let ths = await trs[0].findElements(By.tagName('th'));
            var row1 = [];
            for (var j = 0; j < ths.length; j++) {
                try {
                    let span = await ths[j].findElement(By.tagName('span'));
                    let col = await span.getAttribute('title');
                    row1.push(col);
                } catch (error) {
                    console.log('error: ' + error);
                    let col = await ths[j].getAttribute('innerText');
                    row1.push(col);
                }
            }

            res['tableHead'] = row1;

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

async function getStatisticsTableBody(url, start, end) {

    var res = {};
    let driver = null;
    try {
        driver = await new Builder().forBrowser('firefox')
            .setFirefoxOptions(options).setFirefoxService(serviceBuilder)
            .build();
        driver.manage().window().maximize();
        await driver.get(url);
        try {

            await driver.wait(until.elementsLocated(By.className('box')), 5000);
            const t = await driver.findElements(By.className('box'))
            const table = await t[0].findElement(By.className('responsive-table'));
            const t2 = await table.findElement(By.tagName('table'));

            const body = await t2.findElement(By.tagName('tbody'));
            let rows = await body.findElements(By.tagName('tr'));

            var h = await body.getRect();


            //console.log('params: ', h)
            // await driver.executeScript('document.getElementsByClassName(`subnavi_box`)[0].hidden = true;')
            // await driver.executeScript('document.getElementsByClassName(`large-12 columns megamenu_container megamenu_dark_bar megamenu_dark`)[0].hidden = true;')
            // await driver.executeScript(`window.scrollTo(${h.x}, ${Math.round(h.y)})`)
            // var base64Image = null;
            // await driver.takeScreenshot(true).then(
            //     function (image, err) {
            //         if (err) {
            //             console.log(err.message)
            //         } else {
            //             console.log(image)
            //             //res['imgg1'] = image
            //             base64Image = Buffer.from(image, 'base64');
            //         }
            //     })
            // await sharp(base64Image).extract({
            //     width: Math.round(h.width), height:
            //         Math.round(h.height), left: Math.round(h.x), top: 0
            // }).toBuffer()
            //     .then(function (new_file_info) {
            //         res['image'] = Buffer.from(new_file_info).toString('base64')
            //     })
            //     .catch(function (err) {
            //         console.log('sharp error: ' + err.message)
            //     });

            const trs1 = await body.findElements(By.tagName('tr'));
            res['rows'] = trs1.length;
            res['start'] = start;
            res['end'] = end;
            // console.log(await trs[0].getAttribute('innerText'));
            // let ths = await (await (await t2.findElement(By.tagName('thead'))).findElement('tr')).findElements('th');
            var row11 = [];
            for (var i = start; i < end; i++) {
                let ths1 = await trs1[i].findElements(By.tagName('td'));
                var row1 = [];

                for (var j = 0; j < ths1.length; j++) {

                    if (j == 3) {
                        try {
                            let span = await ths1[j].findElement(By.tagName('img'));
                            let col = await span.getAttribute('src');
                            row1.push(col);
                        } catch (error) {
                            console.log('error: ' + error);
                            let col = await ths1[j].getAttribute('innerText');
                            row1.push(col);
                        }
                    } else {
                        let col = await ths1[j].getAttribute('innerText');
                        row1.push(col);
                    }
                }
                row11.push(row1);
            }

            res['tableBody'] = row11;


        } catch (error) {
            console.log(`error: `, error);
        }
        //console.log(`result: `, res);
        return res;

    } catch (error) { console.log(error.message); return res; }
    finally {
        try { await driver.quit(); } catch (error) {
            console.log(`error: `, error);
        }
    }
};


async function getStatisticsTableFoot(url) {
    var res = {};
    let driver = null;
    try {
        driver = await new Builder().forBrowser('firefox')
            .setFirefoxOptions(options).setFirefoxService(serviceBuilder)
            .build();
        await driver.get(url);
        try {
            await driver.wait(until.elementsLocated(By.className('box')), 5000);
            const t = await driver.findElements(By.className('box'))
            const table = await t[0].findElement(By.className('responsive-table'));
            const t2 = await table.findElement(By.tagName('table'));

            const foot = await t2.findElement(By.tagName('tfoot'));


            const trs2 = await foot.findElements(By.tagName('tr'));
            let ths2 = await trs2[0].findElements(By.tagName('td'));
            var row1 = [];
            for (var j = 0; j < ths2.length; j++) {
                let col = await ths2[j].getAttribute('innerText');
                row1.push(col);
            }

            res['tableFoot'] = row1;

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

async function getListOfDetailedPlayers(url) {
    var res = { "players": [] };
    let driver = null;
    try {
        driver = await new Builder().forBrowser('firefox')
            .setFirefoxOptions(options).setFirefoxService(serviceBuilder)
            .build();
        await driver.get(url);
        try {
            await driver.wait(until.elementsLocated(By.xpath('//*[@id="yw1"]/table')), 5000);
            const t = await driver.findElements(By.xpath('//*[@id="yw1"]/table'))
            //console.log(await t[0].getText());
            //console.log(await (await t[0].findElement(By.tagName('thead'))).getText());
            const body = await t[0].findElement(By.tagName('tbody'));
            const rows = await body.findElements(By.tagName('tr'));
            var len = (await (await body.findElements(By.xpath(`//*[@id="yw1"]/table/tbody/tr`))).length);
            for (var j = 0; j < len; j++) {
                var o = j + 1;
                var col = await rows[j].findElement(By.xpath(`//*[@id="yw1"]/table/tbody/tr[${o}]`));
                //console.log(await col.getText());
                let temp = {};
                let href = await (await col.findElement(By.className("spielprofil_tooltip tooltipstered"))).getAttribute('href');
                console.log(href);
                temp["link"] = href;
                let href1 = await (await col.findElement(By.className("spielprofil_tooltip tooltipstered"))).getAttribute('innerHTML');
                console.log(href1);
                temp["name"] = href1;
                res["players"].push(temp);
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


////*[@id="yw2"]/table
//*[@id="yw0"]/table
//*[@id="yw0"]/table


module.exports = {
    initTransfermarkt: init,
    getSearchQueryTransfermarktResults: getSearchQueryResults,
    getTransfermarktInformation: getInformation,
    getTransfermarktTransferHistory: getTransferHistory,
    getTransfermarktDetailedStatistics: getStatistics2021,
    getTransfermarktDetailedStatisticsUrl: getDetailedStatisticsUrl,
    getTransfermarktDetailedStatisticsTableHead: getStatisticsTableHead,
    getTransfermarktDetailedStatisticsTableBody: getStatisticsTableBody,
    getTransfermarktDetailedStatisticsTableFoot: getStatisticsTableFoot,
    getTransfermarktSearchClubQueryResults: getSearchClubQueryResults,
    getTransfermarktListOfPlayers: getListOfDetailedPlayers
}


//getSearchClubQueryResults("RCD Espanyol Barcelona")
//getListOfDetailedPlayers("https://www.transfermarkt.com/rcd-espanyol-barcelona/kader/verein/714/saison_id/2020");
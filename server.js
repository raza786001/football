const express = require(`express`);
const app = express();
const PORT = process.env.PORT || 7001;
const { getSearchQueryResults, init, getPositionMap, getStrengthAndWeakness, getPentagonMap, getSessionHeatMap, getPersonalInfo, getAverageRating,
    getValue, getMatchesStatistics, getAttackingStatistics,
    getPassingStatistics, getDefendingStatistics, getCardsStatistics,
    getOtherStatistics, getLastMatchesRatings } = require(`./sofa-score/file1`);
const { getSearchQueryTransfermarktResults,
    getTransfermarktInformation, getTransfermarktTransferHistory, getTransfermarktDetailedStatistics,
    getTransfermarktDetailedStatisticsUrl, initTransfermarkt, getTransfermarktDetailedStatisticsTableHead,
    getTransfermarktDetailedStatisticsTableBody,
    getTransfermarktDetailedStatisticsTableFoot, getTransfermarktListOfPlayers, getTransfermarktSearchClubQueryResults } = require(`./transfermarkt/file1`);

const { getFotmobSearchQueryResults, fotmobInit, getFotmobInformation } = require(`./fotmob/file1`);

const { getfotballCriticInformation, fotballCriticInit, getfotballCriticSearchQueryResults, getfotballCriticPointTable } = require(`./footballcritic/file1`);

const { whoscoredInit, getwhoscoredInformation, getwhoscoredLastMatchesAndOverallRatings,
    getwhoscoredSearchQueryResults } = require(`./whoscored/file1`);

const { soccerwayInit, getSoccerwaySideLined, getSoccerwaySearchQueryResults,
} = require(`./soccerway/file1`);

const bodyParser = require(`body-parser`);
const { getSoccerPreviewSearchQueryResults, getSoccerPreviewInjuries, soccerPreviewInit } = require("./soccer-preview/file1");
app.use(bodyParser.json());

app.get(`/api/footballPlayer`, async (req, res) => {
    console.log(`/api/footballPlayer search query param :=> ${req.query.name}`);
    try {
        const result = await getSearchQueryResults(req.query.name);
        console.log(`result :=> `, result);
        res.status(200).send({
            data: result
        });
    } catch (error) {
        res.status(500).send({
            errorMsg: error.message
        });
    }
});

app.get(`/api/footballPlayer/getPositionMap`, async (req, res) => {
    console.log(`/api/footballPlayer/getPositionMap search query param :=> ${req.query.url}`);
    try {
        const result = await getPositionMap(req.query.url);
        console.log(`result :=> `, result);
        res.status(200).send({
            data: result
        });
    } catch (error) {
        res.status(500).send({
            errorMsg: error.message
        });
    }
});

app.get(`/api/footballPlayer/getStrengthAndWeakness`, async (req, res) => {
    console.log(`/api/footballPlayer/getStrengthAndWeakness search query param :=> ${req.query.url}`);
    try {
        const result = await getStrengthAndWeakness(req.query.url);
        console.log(`result :=> `, result);
        res.status(200).send({
            data: result
        });
    } catch (error) {
        res.status(500).send({
            errorMsg: error.message
        });
    }
});

app.get(`/api/footballPlayer/getPentagonMap`, async (req, res) => {
    console.log(`/api/footballPlayer/getPentagonMap search query param :=> ${req.query.url}`);
    try {
        const result = await getPentagonMap(req.query.url);
        console.log(`result :=> `, result);
        res.status(200).send({
            data: result
        });
    } catch (error) {
        res.status(500).send({
            errorMsg: error.message
        });
    }
});

app.get(`/api/footballPlayer/getSessionHeatMap`, async (req, res) => {
    console.log(`/api/footballPlayer/getSessionHeatMap search query param :=> ${req.query.url}`);
    try {
        const result = await getSessionHeatMap(req.query.url);
        console.log(`result :=> `, result);
        res.status(200).send({
            data: result
        });
    } catch (error) {
        res.status(500).send({
            errorMsg: error.message
        });
    }
});

app.get(`/api/footballPlayer/getPersonalInfo`, async (req, res) => {
    console.log(`/api/footballPlayer/getPersonalInfo search query param :=> ${req.query.url}`);
    try {
        const result = await getPersonalInfo(req.query.url);
        console.log(`result :=> `, result);
        res.status(200).send({
            data: result
        });
    } catch (error) {
        res.status(500).send({
            errorMsg: error.message
        });
    }
});

app.get(`/api/footballPlayer/getAverageRating`, async (req, res) => {
    console.log(`/api/footballPlayer/getAverageRating search query param :=> ${req.query.url}`);
    try {
        const result = await getAverageRating(req.query.url);
        console.log(`result :=> `, result);
        res.status(200).send({
            data: result
        });
    } catch (error) {
        res.status(500).send({
            errorMsg: error.message
        });
    }
});

app.get(`/api/footballPlayer/getValue`, async (req, res) => {
    console.log(`/api/footballPlayer/getValue search query param :=> ${req.query.url}`);
    try {
        const result = await getValue(req.query.url);
        console.log(`result :=> `, result);
        res.status(200).send({
            data: result
        });
    } catch (error) {
        res.status(500).send({
            errorMsg: error.message
        });
    }
});

app.get(`/api/footballPlayer/getMatchesStatistics`, async (req, res) => {
    console.log(`/api/footballPlayer/getMatchesStatistics search query param :=> ${req.query.url}`);
    try {
        const result = await getMatchesStatistics(req.query.url);
        console.log(`result :=> `, result);
        res.status(200).send({
            data: result
        });
    } catch (error) {
        res.status(500).send({
            errorMsg: error.message
        });
    }
});

app.get(`/api/footballPlayer/getAttackingStatistics`, async (req, res) => {
    console.log(`/api/footballPlayer/getAttackingStatistics search query param :=> ${req.query.url}`);
    try {
        const result = await getAttackingStatistics(req.query.url);
        console.log(`result :=> `, result);
        res.status(200).send({
            data: result
        });
    } catch (error) {
        res.status(500).send({
            errorMsg: error.message
        });
    }
});

app.get(`/api/footballPlayer/getPassingStatistics`, async (req, res) => {
    console.log(`/api/footballPlayer/getPassingStatistics search query param :=> ${req.query.url}`);
    try {
        const result = await getPassingStatistics(req.query.url);
        console.log(`result :=> `, result);
        res.status(200).send({
            data: result
        });
    } catch (error) {
        res.status(500).send({
            errorMsg: error.message
        });
    }
});

app.get(`/api/footballPlayer/getDefendingStatistics`, async (req, res) => {
    console.log(`/api/footballPlayer/getDefendingStatistics search query param :=> ${req.query.url}`);
    try {
        const result = await getDefendingStatistics(req.query.url);
        console.log(`result :=> `, result);
        res.status(200).send({
            data: result
        });
    } catch (error) {
        res.status(500).send({
            errorMsg: error.message
        });
    }
});

app.get(`/api/footballPlayer/getOtherStatistics`, async (req, res) => {
    console.log(`/api/footballPlayer/getOtherStatistics search query param :=> ${req.query.url}`);
    try {
        const result = await getOtherStatistics(req.query.url);
        console.log(`result :=> `, result);
        res.status(200).send({
            data: result
        });
    } catch (error) {
        res.status(500).send({
            errorMsg: error.message
        });
    }
});

app.get(`/api/footballPlayer/getCardsStatistics`, async (req, res) => {
    console.log(`/api/footballPlayer/getCardsStatistics search query param :=> ${req.query.url}`);
    try {
        const result = await getCardsStatistics(req.query.url);
        console.log(`result :=> `, result);
        res.status(200).send({
            data: result
        });
    } catch (error) {
        res.status(500).send({
            errorMsg: error.message
        });
    }
});

app.get(`/api/footballPlayer/getLastMatchesRatings`, async (req, res) => {
    console.log(`/api/footballPlayer/getLastMatchesRatings search query param :=> ${req.query.url}`);
    try {
        const result = await getLastMatchesRatings(req.query.url);
        console.log(`result :=> `, result);
        res.status(200).send({
            data: result
        });
    } catch (error) {
        res.status(500).send({
            errorMsg: error.message
        });
    }
});

app.get(`/healthCheckUp`, (req, res) => {
    res.status(200).send({
        status: `ok`
    });
});

app.get(`/api/footballPlayer/transfermarkt/search`, async (req, res) => {
    console.log(`/api/footballPlayer/transfermarkt/search search query param :=> ${req.query.name}`);
    try {
        const result = await getSearchQueryTransfermarktResults(req.query.name);
        console.log(`result :=> `, result);
        res.status(200).send({
            data: result
        });
    } catch (error) {
        res.status(500).send({
            errorMsg: error.message
        });
    }
});

app.get(`/api/footballPlayer/transfermarkt/search`, async (req, res) => {
    console.log(`/api/footballPlayer/transfermarkt/search search query param :=> ${req.query.name}`);
    try {
        const result = await getSearchQueryTransfermarktResults(req.query.name);
        console.log(`result :=> `, result);
        res.status(200).send({
            data: result
        });
    } catch (error) {
        res.status(500).send({
            errorMsg: error.message
        });
    }
});

app.get(`/api/footballPlayer/transfermarkt/getPersonalInfo`, async (req, res) => {
    console.log(`/api/footballPlayer/transfermarkt/getPersonalInfo search query param :=> ${req.query.url}`);
    try {
        const result = await getTransfermarktInformation(req.query.url);
        console.log(`result :=> `, result);
        res.status(200).send({
            data: result
        });
    } catch (error) {
        res.status(500).send({
            errorMsg: error.message
        });
    }
});

app.get(`/api/footballPlayer/transfermarkt/getTransferHistory`, async (req, res) => {
    console.log(`/api/footballPlayer/transfermarkt/getTransferHistory search query param :=> ${req.query.url}`);
    try {
        const result = await getTransfermarktTransferHistory(req.query.url);
        res.status(200).send({
            data: result
        });
    } catch (error) {
        res.status(500).send({
            errorMsg: error.message
        });
    }
});

app.get(`/api/footballPlayer/transfermarkt/getDetailedStatistics`, async (req, res) => {
    console.log(`/api/footballPlayer/transfermarkt/getDetailedStatistics search query param :=> ${req.query.url}`);
    try {
        const result = await getTransfermarktDetailedStatistics(req.query.url);
        res.status(200).send({
            data: result
        });
    } catch (error) {
        res.status(500).send({
            errorMsg: error.message
        });
    }
});

app.get(`/api/footballPlayer/transfermarkt/getDetailedStatisticsUrl`, async (req, res) => {
    console.log(`/api/footballPlayer/transfermarkt/getDetailedStatisticsUrl search query param :=> ${req.query.url}`);
    try {
        const result = await getTransfermarktDetailedStatisticsUrl(req.query.url);
        res.status(200).send({
            data: result
        });
    } catch (error) {
        res.status(500).send({
            errorMsg: error.message
        });
    }
});

app.get(`/api/footballPlayer/transfermarkt/getDetailedStatisticsTableHead`, async (req, res) => {
    console.log(`/api/footballPlayer/transfermarkt/getDetailedStatisticsTableHead search query param :=> ${req.query.url}`);
    try {
        const result = await getTransfermarktDetailedStatisticsTableHead(req.query.url);
        res.status(200).send({
            data: result
        });
    } catch (error) {
        res.status(500).send({
            errorMsg: error.message
        });
    }
});

app.get(`/api/footballPlayer/transfermarkt/getDetailedStatisticsTableFoot`, async (req, res) => {
    console.log(`/api/footballPlayer/transfermarkt/getDetailedStatisticsTableFoot search query param :=> ${req.query.url}`);
    try {
        const result = await getTransfermarktDetailedStatisticsTableFoot(req.query.url,
            req.query);
        res.status(200).send({
            data: result
        });
    } catch (error) {
        res.status(500).send({
            errorMsg: error.message
        });
    }
});

app.get(`/api/footballPlayer/transfermarkt/getDetailedStatisticsTableBody`, async (req, res) => {
    console.log(`/api/footballPlayer/transfermarkt/getDetailedStatisticsTableBody search query param :=> ${req.query.url}, ${req.query.start}, ${req.query.end}`);
    try {
        const result = await getTransfermarktDetailedStatisticsTableBody(req.query.url,
            req.query.start, req.query.end);
        res.status(200).send({
            data: result
        });
    } catch (error) {
        res.status(500).send({
            errorMsg: error.message
        });
    }
});

app.get(`/api/footballPlayer/transfermarkt/getListOfDetailedPlayers`, async (req, res) => {
    console.log(`/api/footballPlayer/transfermarkt/getListOfDetailedPlayers search query param :=> ${req.query.url}`);
    try {
        const result = await getTransfermarktListOfPlayers(req.query.url);
        res.status(200).send({
            data: result
        });
    } catch (error) {
        res.status(500).send({
            errorMsg: error.message
        });
    }
});

app.get(`/api/footballPlayer/transfermarkt/getClubUrl`, async (req, res) => {
    console.log(`/api/footballPlayer/transfermarkt/getClubUrl search query param :=> ${req.query.name}`);
    try {
        const result = await getTransfermarktSearchClubQueryResults(req.query.name);
        res.status(200).send({
            data: result
        });
    } catch (error) {
        res.status(500).send({
            errorMsg: error.message
        });
    }
});

app.get(`/api/fotmob/footballPlayer`, async (req, res) => {
    console.log(`/api/fotmob/footballPlayer search query param :=> ${req.query.name}`);
    try {
        const result = await getFotmobSearchQueryResults(req.query.name);
        console.log(`result :=> `, result);
        res.status(200).send({
            data: result
        });
    } catch (error) {
        res.status(500).send({
            errorMsg: error.message
        });
    }
});

app.get(`/api/fotmob/getPlayerInfo`, async (req, res) => {
    console.log(`/api/fotmob/getPlayerInfo search query param :=> ${req.query.url}`);
    try {
        const result = await getFotmobInformation(req.query.url);
        console.log(`result :=> `, result);
        res.status(200).send({
            data: result
        });
    } catch (error) {
        res.status(500).send({
            errorMsg: error.message
        });
    }
});

app.get(`/api/footballcritic/footballPlayer`, async (req, res) => {
    console.log(`/api/footballcritic/footballPlayer search query param :=> ${req.query.name}`);
    try {
        const result = await getfotballCriticSearchQueryResults(req.query.name);
        console.log(`result :=> `, result);
        res.status(200).send({
            data: result
        });
    } catch (error) {
        res.status(500).send({
            errorMsg: error.message
        });
    }
});

app.get(`/api/footballcritic/getPlayerInfo`, async (req, res) => {
    console.log(`/api/footballcritic/getPlayerInfo search query param :=> ${req.query.url}`);
    try {
        const result = await getfotballCriticInformation(req.query.url);
        console.log(`result :=> `, result);
        res.status(200).send({
            data: result
        });
    } catch (error) {
        res.status(500).send({
            errorMsg: error.message
        });
    }
});

app.get(`/api/footballcritic/getPointTable`, async (req, res) => {
    console.log(`/api/footballcritic/getPointTable search query param :=> ${req.query.url}`);
    try {
        const result = await getfotballCriticPointTable(req.query.url);
        console.log(`result :=> `, result);
        res.status(200).send({
            data: result
        });
    } catch (error) {
        res.status(500).send({
            errorMsg: error.message
        });
    }
});

app.get(`/api/whoscored/footballPlayer`, async (req, res) => {
    console.log(`/api/whoscored/footballPlayer search query param :=> ${req.query.name}`);
    try {
        const result = await getwhoscoredSearchQueryResults(req.query.name);
        console.log(`result :=> `, result);
        res.status(200).send({
            data: result
        });
    } catch (error) {
        res.status(500).send({
            errorMsg: error.message
        });
    }
});

app.get(`/api/whoscored/getPlayerInfo`, async (req, res) => {
    console.log(`/api/whoscored/getPlayerInfo search query param :=> ${req.query.url}`);
    try {
        const result = await getwhoscoredInformation(req.query.url);
        console.log(`result :=> `, result);
        res.status(200).send({
            data: result
        });
    } catch (error) {
        res.status(500).send({
            errorMsg: error.message
        });
    }
});

app.get(`/api/whoscored/getMatchesAndRating`, async (req, res) => {
    console.log(`/api/whoscored/getMatchesAndRating search query param :=> ${req.query.url}`);
    try {
        const result = await getwhoscoredLastMatchesAndOverallRatings(req.query.url);
        console.log(`result :=> `, result);
        res.status(200).send({
            data: result
        });
    } catch (error) {
        res.status(500).send({
            errorMsg: error.message
        });
    }
});

app.get(`/api/soccerPreview/footballPlayer`, async (req, res) => {
    console.log(`/api/soccerPreview/footballPlayer search query param :=> ${req.query.name}`);
    try {
        const result = await getSoccerPreviewSearchQueryResults(req.query.name);
        console.log(`result :=> `, result);
        res.status(200).send({
            data: result
        });
    } catch (error) {
        res.status(500).send({
            errorMsg: error.message
        });
    }
});

app.get(`/api/soccerPreview/getInjuries`, async (req, res) => {
    console.log(`/api/soccerPreview/getInjuries search query param :=> ${req.query.url}`);
    try {
        const result = await getSoccerPreviewInjuries(req.query.url);
        console.log(`result :=> `, result);
        res.status(200).send({
            data: result
        });
    } catch (error) {
        res.status(500).send({
            errorMsg: error.message
        });
    }
});

app.get(`/api/soccerway/footballPlayer`, async (req, res) => {
    console.log(`/api/soccerway/footballPlayer search query param :=> ${req.query.name}`);
    try {
        const result = await getSoccerwaySearchQueryResults(req.query.name);
        console.log(`result :=> `, result);
        res.status(200).send({
            data: result
        });
    } catch (error) {
        res.status(500).send({
            errorMsg: error.message
        });
    }
});

app.get(`/api/soccerway/getSideline`, async (req, res) => {
    console.log(`/api/soccerway/getSideline search query param :=> ${req.query.url}`);
    try {
        const result = await getSoccerwaySideLined(req.query.url);
        console.log(`result :=> `, result);
        res.status(200).send({
            data: result
        });
    } catch (error) {
        res.status(500).send({
            errorMsg: error.message
        });
    }
});

app.listen(PORT, async () => {
    await init();
    await initTransfermarkt();
    await fotmobInit();
    await fotballCriticInit();
    await whoscoredInit();
    await soccerPreviewInit();
    await soccerwayInit();
    console.log(`server running at ${PORT}`)
});
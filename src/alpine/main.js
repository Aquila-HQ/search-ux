console.log("Welcome to Aquila Network! Nothing interesting is here to see. \nMaybe https://docs.aquila.network might interest you.")

// Tailwind configurations
tailwind.config = {
    theme: {
        extend: {
            colors: {
                clifford: '#da373d',
            }
        }
    }
}

// globals
const chromeExtensionID = "albdahjdcmldbcpjmbnbcbckgndaibnk"

// TODO: reload on history travel

// Alpine initialized succesfully
document.addEventListener('alpine:init', () => {
    // Initialize all Alpine datastructures (Alpine Store)
    initPageParams()
    initURLParams()
    initAuthentication()
    initProfileInformation()
    // magics
    initClipBoardMagic()
    // home
    initSearchInput()
    initSearchResults()
    // list
    initSubscriptionProfilesList()
    // explore
    initExploreHandPicks()
    initExploreOtherPicks()
})

// Webpage is loaded and ready
window.onload = function () {
    // initialize url params on load
    Alpine.store('urlParams').loadURLParams()
    // initialize user by performing authentication on load
    Alpine.store('authentication').authenticate()
        .then(response => {

            // load profile, if share URL param is given
            if (Alpine.store('urlParams').shareID != null) {
                Alpine.store('profileInfo').loadProfileInfo(Alpine.store('authentication').host, Alpine.store('urlParams').shareID)
            }

            // --- HOME page ---
            if (Alpine.store('pageParams').page == 'home') {
                // Fill search/List content accordingly
                fillSLContentAction()
            }

            // --- EXPLORE page ---
            if (Alpine.store('pageParams').page == 'explore') {
                // Fill explore cards accordingly
                Alpine.store('exploreHandpicks').loadHandpicksInfo(Alpine.store('authentication').host)
                Alpine.store('exploreOtherpicks').loadOtherpicksInfo(Alpine.store('authentication').host)
            }

            // --- LIST page ---
            if (Alpine.store('pageParams').page == 'list') {
                // Fill mixed search/List content accordingly
                fillMXContentAction()
                Alpine.store('subscriptionsList').loadSubscriptionInfo(Alpine.store('authentication').host, Alpine.store('authentication').secretKey)
            }


        })
}

// ----------------------------- 1) Configure Alpine datastructures --------------------------------------------------

function initPageParams() {
    // Initialize parameters by to identify current page 
    Alpine.store('pageParams', {
        toggleTheme() {
            // toggle dark mode
            this.isDarkMode = !this.isDarkMode
            if (this.isDarkMode) {
                this.theme = 'dark'
            } else {
                this.theme = 'emerald'
            }
        },
        page: null,
        theme: 'emerald',
        isDarkMode: false
    })
}

function initURLParams() {
    // Initialize by fetching anything that's available in the url parameters for later actions 
    Alpine.store('urlParams', {
        loadURLParams() {
            // get params
            const urlParams = new URLSearchParams(window.location.search)

            // validate & assign params
            // 1. query
            queryText = urlParams.get("q")
            if (queryText != null && queryText.trim() === "") {
                queryText = null
            }
            this.queryText = queryText

            // 2. share ID
            shareID = urlParams.get("share")
            if (shareID != null && shareID.trim() === "") {
                shareID = null
            }
            this.shareID = shareID
        },
        shareID: null,
        queryText: null
    })
}

function initAuthentication() {
    // Authenticate user by communicating with addon, fetch user profile & keep it
    Alpine.store('authentication', {
        async authenticate() {

            // get secret key from addon
            addonData = await fetchSecretADDON()

            // update host, secret
            this.host = addonData.host
            this.secretKey = addonData.secretKey

            if (addonData.secretKey == null) {
                this.isAuthenticated = false
            } else {
                // get authentication status from API
                AuthenticateAPI(addonData.host, addonData.secretKey)
                    .then(result => {
                        this.isAuthenticated = result
                        Alpine.store('authentication').loadUserInfo()
                    })
            }
        },
        isAuthenticated: false,
        loadUserInfo() {
            // get user information from API
            fetchUserAPI(addonData.host, addonData.secretKey)
                .then(result => {
                    this.user = result
                    // update profile info to user info, if no share URL is given
                    if (Alpine.store('urlParams').shareID == null) {
                        Alpine.store('profileInfo').profile = this.user
                    }
                })
        },
        user: null,
        host: null,
        secretKey: null
    })
}

function initProfileInformation() {
    // Get profile information for any public profile given the ID
    Alpine.store('profileInfo', {
        loadProfileInfo(host, shareID) {
            // call API to get data for a profile with ShareID

            fetchProfileAPI(host, shareID)
                .then(result => {
                    if (result) {
                        this.profile = result
                    }
                })
        },
        profile: {
            name: null,
            rating: null,
            avatar: null,
            description: null,
            publicURL: null
        }
    })
}

function initSearchInput() {
    // get all search input configurations, parametrs, filters, query etc.
    Alpine.store('searchInput', {
        queryText: null
    })
}

function initSearchResults() {
    // configure & cache search results for a personal/public search & aggregated search separately
    Alpine.store('listedResults', {
        resett() {
            this.results = undefined
        },
        results: undefined,
        resultsPerPage: 10,
        nextPage: 1
    })

    Alpine.store('mixedResults', {
        resett() {
            this.results = []
        },
        results: [],
        resultsPerPage: 10,
        nextPage: 1
    })
}

function initSubscriptionProfilesList() {
    // Init list of subscriptions by the user
    Alpine.store('subscriptionsList', {
        resett() {
            this.results = []
        },
        loadSubscriptionInfo(host, secretKey) {
            // call API to get data for a profile with ShareID
            listSubscriptionsAPI(host, secretKey)
                .then(result => {
                    if (result) {
                        this.results = result
                    }
                })
        },
        results: []
    })
}

function initExploreHandPicks() {
    // Init list of Handpicked profiles
    Alpine.store('exploreHandpicks', {
        resett() {
            this.results = []
        },
        loadHandpicksInfo(host) {
            // call API to get data for a profile with ShareID
            listHandpicksAPI(host)
                .then(result => {
                    if (result) {
                        this.results = result
                    }
                })
        },
        results: []
    })
}

function initExploreOtherPicks() {
    // Init list of Otherpicked profiles
    Alpine.store('exploreOtherpicks', {
        resett() {
            this.results = []
        },
        loadOtherpicksInfo(host) {
            // call API to get data for a profile with ShareID
            listOtherpicksAPI(host)
                .then(result => {
                    if (result) {
                        this.results = result
                    }
                })
        },
        results: []
    })
}

// ----------------------------------- 1.1) Alpine Magics -----------------------------------------------------

function initClipBoardMagic() {
    // Init clipboard magic function
    Alpine.magic('clipboard', () => clipData => {
        navigator.clipboard.writeText(clipData)
    })
}

// ----------------------------------- 2) API calls to addon / server -----------------------------------------

function fetchSecretADDON() {
    host = "https://x.aquila.network"
    secretKey = null

    return new Promise(function (resolve, reject) {
        // setTimeout(function () {
        //     resolve('test');
        // }, 4000);


        try {
            if (chrome && chrome.runtime) {
                chrome.runtime.sendMessage(chromeExtensionID, {},
                    function (response) {
                        if (response && response.success) {
                            secretKey = response.key
                            resolve({
                                host: host,
                                secretKey: secretKey
                            })
                        }
                        else {
                            secretKey = localStorage.getItem("axapi")
                            resolve({
                                host: host,
                                secretKey: secretKey
                            })
                        }
                    }
                )
            }
            else {
                secretKey = localStorage.getItem("axapi")
                resolve({
                    host: host,
                    secretKey: secretKey
                })
            }
        }
        catch (e) {
            secretKey = localStorage.getItem("axapi")
            resolve({
                host: host,
                secretKey: secretKey
            })
        }
    });
}

async function AuthenticateAPI(host, secretKey) {
    let myHeaders = new Headers()
    myHeaders.append("Content-Type", "application/json")

    let raw = JSON.stringify({
        "key": secretKey
    })

    let requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    }

    let response = await fetch(host + "/api/user", requestOptions)
        .catch((error) => {

        })

    if (response) {
        return response.ok
    } else {
        return false
    }
}

async function fetchUserAPI(host, secretKey) {
    let myHeaders = new Headers()
    myHeaders.append("Content-Type", "application/json")

    let raw = JSON.stringify({
        "key": secretKey
    })

    let requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    }

    let userResponse = await fetch(host + "/api/user", requestOptions)
        .then((userResponse) => userResponse.json())
        .catch((error) => {
            return null
        })

    if (userResponse) {
        let pubResponse = await getPublicURLAPI(host, secretKey)
            .then((result) => result)

        if (pubResponse) {
            let publicIDTemp = null
            if (pubResponse.isActive) {
                publicIDTemp = pubResponse.id
            }

            return {
                name: userResponse.user[0].name,
                rating: 4,
                avatar: "https://api.lorem.space/image/face?hash=92310",
                description: userResponse.user[0].title,
                publicURL: publicIDTemp
            }
        } else {
            return null
        }

    } else {
        return null
    }
}

async function getPublicURLAPI(host, secretKey) {
    var myHeaders = new Headers()
    myHeaders.append("Content-Type", "application/json")

    var raw = JSON.stringify({
        "key": secretKey
    })

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    }

    let response = await fetch(host + "/api/url/public", requestOptions)
        .then(response => response.json())
        .catch((error) => {
            return null
        })

    if (response) {
        return response.publicIndexId[0]
    } else {
        return null
    }
}

async function fetchProfileAPI(host, publicID) {
    var myHeaders = new Headers()
    myHeaders.append("Content-Type", "application/json")

    var raw = JSON.stringify({
        "publicIndexId": publicID
    })

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    }

    let response = await fetch(host + "/api/user", requestOptions)
        .then(response => response.json())
        .catch((error) => {
            return null
        })

    if (response) {
        return {
            name: response.user[0].name,
            rating: 4,
            avatar: "https://api.lorem.space/image/face?hash=92310",
            description: response.user[0].title,
            publicURL: publicID
        }
    } else {
        return null
    }
}

async function listPrivateAPI(host, secretKey, page, noItems) {
    var myHeaders = new Headers()
    myHeaders.append("Content-Type", "application/json")

    var raw = JSON.stringify({
        "page": page,
        "key": secretKey,
        "limit": noItems
    })

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    }

    let response = await fetch(host + "/api/list", requestOptions)
        .then(response => response.json())
        .catch((error) => {
            return []
        })

    if (response) {
        let urls = response.result.links.map(({ url }) => url)
        // fetch url summary
        let sumResponse = await URLSummaryPrivateAPI(host, secretKey, urls)
            .then((result) => result)

        let retTmp = []

        var i = 0, len = sumResponse.length;
        while (i < len) {
            retTmp.push({
                title: (sumResponse[i].title || sumResponse[i].url).substring(0, 70),
                url: sumResponse[i].url,
                description: sumResponse[i].summary.substring(0, 200) + "..",
                timestamp: moment((new Date(response.result.links[i].timestamp * 1000))).fromNow(),
                author: sumResponse[i].author,
                website: (new URL(sumResponse[i].url)).hostname
            })

            i++
        }

        return retTmp
    } else {
        return null
    }
}

async function searchPrivateAPI(host, secretKey, query, page, noItems) {
    var myHeaders = new Headers()
    myHeaders.append("Content-Type", "application/json")

    var raw = JSON.stringify({
        "key": secretKey,
        "query": query
    })

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    }

    let response = await fetch(host + "/api/search", requestOptions)
        .then(response => response.json())
        .catch((error) => {
            return []
        })

    if (response) {
        // sort results
        let sortedResults = Object.entries(response.result)
            .sort(([, a], [, b]) => b - a)
            .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

        let urls = Object.keys(sortedResults)
        // fetch url summary
        let sumResponse = await URLSummaryPrivateAPI(host, secretKey, urls)
            .then((result) => result)

        let retTmp = []

        var i = 0, len = sumResponse.length;
        while (i < len) {
            retTmp.push({
                title: (sumResponse[i].title || sumResponse[i].url).substring(0, 70),
                url: sumResponse[i].url,
                description: sumResponse[i].summary.substring(0, 200) + "..",
                timestamp: null,
                author: sumResponse[i].author,
                website: (new URL(sumResponse[i].url)).hostname
            })

            i++
        }

        return retTmp
    } else {
        return null
    }
}

async function URLSummaryPrivateAPI(host, secretKey, urls) {
    var myHeaders = new Headers()
    myHeaders.append("Content-Type", "application/json")

    var raw = JSON.stringify({
        "key": secretKey,
        "urls": urls
    })

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    }

    let response = await fetch(host + "/api/urlsummary", requestOptions)
        .then(response => response.json())
        .catch((error) => {
            return null
        })

    if (response && response.result) {
        return response.result.summary
    } else {
        return []
    }
}

async function listPublicAPI(host, publicID, page, noItems) {
    var myHeaders = new Headers()
    myHeaders.append("Content-Type", "application/json")

    var raw = JSON.stringify({
        "page": page,
        "publicIndexId": publicID,
        "limit": noItems
    })

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    }

    let response = await fetch(host + "/api/list", requestOptions)
        .then(response => response.json())
        .catch((error) => {
            return []
        })

    if (response) {
        let urls = response.result.links.map(({ url }) => url)
        // fetch url summary
        let sumResponse = await URLSummaryPublicAPI(host, publicID, urls)
            .then((result) => result)

        let retTmp = []

        var i = 0, len = sumResponse.length;
        while (i < len) {
            retTmp.push({
                title: (sumResponse[i].title || sumResponse[i].url).substring(0, 70),
                url: sumResponse[i].url,
                description: sumResponse[i].summary.substring(0, 200) + "..",
                timestamp: moment((new Date(response.result.links[i].timestamp * 1000))).fromNow(),
                author: sumResponse[i].author,
                website: (new URL(sumResponse[i].url)).hostname
            })

            i++
        }

        return retTmp
    } else {
        return null
    }
}

async function searchPublicAPI(host, publicID, query, page, noItems) {
    var myHeaders = new Headers()
    myHeaders.append("Content-Type", "application/json")

    var raw = JSON.stringify({
        "publicIndexId": publicID,
        "query": query
    })

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    }

    let response = await fetch(host + "/api/search", requestOptions)
        .then(response => response.json())
        .catch((error) => {
            return []
        })

    if (response) {
        // sort results
        let sortedResults = Object.entries(response.result)
            .sort(([, a], [, b]) => b - a)
            .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

        let urls = Object.keys(sortedResults)
        // fetch url summary
        let sumResponse = await URLSummaryPublicAPI(host, publicID, urls)
            .then((result) => result)

        let retTmp = []

        var i = 0, len = sumResponse.length;
        while (i < len) {
            retTmp.push({
                title: (sumResponse[i].title || sumResponse[i].url).substring(0, 70),
                url: sumResponse[i].url,
                description: sumResponse[i].summary.substring(0, 200) + "..",
                timestamp: null,
                author: sumResponse[i].author,
                website: (new URL(sumResponse[i].url)).hostname
            })

            i++
        }

        return retTmp
    } else {
        return null
    }
}

async function URLSummaryPublicAPI(host, publicID, urls) {
    var myHeaders = new Headers()
    myHeaders.append("Content-Type", "application/json")

    var raw = JSON.stringify({
        "publicIndexId": publicID,
        "urls": urls
    })

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    }

    let response = await fetch(host + "/api/urlsummary", requestOptions)
        .then(response => response.json())
        .catch((error) => {
            return null
        })

    if (response && response.result) {
        return response.result.summary
    } else {
        return []
    }
}

function correctAPI(host, secretKey, query, url, itemID) {
    return true
}

async function listSubscriptionsAPI(host, secretKey) {
    x = [
        {
            name: "Wei Dailley",
            avatar: "https://api.lorem.space/image/face?hash=92319"
        },
        {
            name: "Max Willows",
            avatar: "https://api.lorem.space/image/face?hash=92318"
        },
        {
            name: "Diggwayne Md",
            avatar: "https://api.lorem.space/image/face?hash=92317"
        }
    ]

    var myHeaders = new Headers()
    myHeaders.append("Content-Type", "application/json")

    var raw = JSON.stringify({
        "key": secretKey
    })

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    }

    let response = await fetch(host + "/api/subscribe/list", requestOptions)
        .then(response => response.json())
        .catch((error) => {
            return []
        })

    if (response) {
        var i = 0, len = response.subscribeList.length;

        retTmp = []
        while (i < len) {
            publicIndexId = response.subscribeList[i].publicIndexId

            let profileResponse = await fetchProfileAPI(host, publicIndexId)
                .then((result) => result)


            if (profileResponse) {
                retTmp.push({
                    name: profileResponse.name,
                    avatar: "https://api.lorem.space/image/face?hash=92319",
                    publicURL: publicIndexId
                })
            }

            i++
        }

        return retTmp
    } else {
        return []
    }
}

async function listHandpicksAPI(host) {
    return [
        {
            name: "₿ Zero to Maxi 101",
            avatar: "https://api.lorem.space/image/face?hash=92319",
            description: "Zero to maxi is a collection of actively curated resources to go head first through Bitcoin rabbit hole, get lost, and never crawl back up, literally 😀⚠️.",
            publicURL: "CJJ9ZGQEcK1Jffs6Ji2cTpVW4oiYP6X3VCP9YH4KhC"
        },
        {
            name: "Lyn Alden",
            avatar: "https://api.lorem.space/image/face?hash=92319",
            description: "Provides equity research and investment strategies, the insight and data you need for managing your money.",
            publicURL: "AGLMqemuHwffaWumSt61HaBDSJB6mwWNyVrYEDy637"
        },
        {
            name: "Matthew Ball VC",
            avatar: "https://api.lorem.space/image/face?hash=92319",
            description: "Managing Partner of EpyllionCo, which operates an early stage venture fund, as well as a corporate and venture advisory arm.",
            publicURL: "AJiZJZ8ntrcF9EtRvPuXjLSyr3AE76n4KLsrSSXpvV"
        },
        {
            name: "George Hotz",
            avatar: "https://api.lorem.space/image/face?hash=92319",
            description: "A security hacker, entrepreneur, and software engineer. He's president at comma.ai, set out to f* WIN self driving and robotics. ",
            publicURL: "GgoEdGqu2kuzqaabQp4KpiaJPG4rpN9eoJgx1zY3or"
        },
        {
            name: "Don't be Evil",
            avatar: "https://api.lorem.space/image/face?hash=92319",
            description: "Track how Google is breaking the Internet one step at a time.",
            publicURL: "9C4DVctaqGSfyZTEjW4YU1i7CsvCWaGSjJyGyM4Wop"
        }
    ]
}

async function listOtherpicksAPI(host) {
    return [
        {
            name: "Nibin Peter",
            avatar: "https://api.lorem.space/image/face?hash=92319",
            description: "Distributed systems developer. Talks about the Web and Linux.",
            publicURL: "8oWUvderGL6X1MiAtJ4EJmTSveTDnua9DipKDwHqtG"
        },
        {
            name: "Maneksh MS",
            avatar: "https://api.lorem.space/image/face?hash=92319",
            description: "Talks about User Experiance.",
            publicURL: "AWk3YrQBCrr9wzWJjeKEGYoBc6srdkgwBRq81w67D4"
        },
        {
            name: "Philip Vollet",
            avatar: "https://api.lorem.space/image/face?hash=92319",
            description: "Growth Manager. Talks about AI and ML toolchains.",
            publicURL: "8CyUB3USJ9PDeajhd7XVABvrgj2gCCw1nGB4MtRHFA"
        },
        {
            name: "Y Combinator News",
            avatar: "https://api.lorem.space/image/face?hash=92319",
            description: "Top rated tech news from YC, everyday. YC is created for funding early stage startups.",
            publicURL: "3NcizoNvMndZwWre9NwhBKFFZ2QvqipCLtoUnjQcZD"
        },
        {
            name: "Accubits Devs",
            avatar: "https://api.lorem.space/image/face?hash=92319",
            description: "Awesome Open Source softwares that software developers at Accubits admire.",
            publicURL: "EjozLMdHYYWXjJYZb7orN6Zxxbf8KMC9SmzCrUm4bi"
        },
        {
            name: "Indie Hackers",
            avatar: "https://api.lorem.space/image/face?hash=92319",
            description: "Top content from Indie Hackers. Indie Entrepreneurs help indies.",
            publicURL: "DCdvrFMfkvAE1mtp52rsvgEY7wo2Gx6mqiATGkEeGa"
        },
        {
            name: "Dev.to",
            avatar: "https://api.lorem.space/image/face?hash=92319",
            description: "Top rated content from Dev.to platform.",
            publicURL: "BCkYUwHYUcbtx5etUZUAKHLcyYeQ7Yk3haqKaTGA1a"
        }
    ]
}

async function userSubscribeAPI(host, secretKey, publicID) {
    var myHeaders = new Headers()
    myHeaders.append("Content-Type", "application/json")

    var raw = JSON.stringify({
        "publicIndexId": publicID,
        "key": secretKey
    })

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    }

    let response = await fetch(host + "/api/subscribe", requestOptions)
        .then(response => response.json())
        .catch((error) => {
            return null
        })

    if (response) {
        return response
    } else {
        return null
    }
}

async function userUnSubscribeAPI(host, secretKey, publicID) {
    var myHeaders = new Headers()
    myHeaders.append("Content-Type", "application/json")

    var raw = JSON.stringify({
        "publicIndexId": publicID,
        "key": secretKey
    })

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    }

    let response = await fetch(host + "/api/subscribe/delete", requestOptions)
        .then(response => response.json())
        .catch((error) => {
            return null
        })

    if (response) {
        return response
    } else {
        return null
    }
}

async function userIsSubscribedAPI(host, secretKey, publicID) {
    var myHeaders = new Headers()
    myHeaders.append("Content-Type", "application/json")

    var raw = JSON.stringify({
        "publicIndexId": publicID,
        "key": secretKey
    })

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    }

    let response = await fetch(host + "/api/subscribe/check", requestOptions)
        .then(response => response.json())
        .catch((error) => {
            return null
        })

    if (response) {
        return response
    } else {
        return null
    }
}

// ----------------------------------- 3) Event listeners ----------------------------------------- 

// Listen to search input content change
// User searched
function onUserSearchedEvent() {
    Alpine.store('listedResults').resett()

    // update url history
    let searchQuery = Alpine.store('urlParams').queryText
    if (searchQuery) {

        window.history.pushState('', '', window.location.href.split('?')[0] + '?q=' + searchQuery.replace(/ +(?= )/g, '').split(" ").join("+"));
        if (Alpine.store('urlParams').shareID != null) {
            window.history.pushState('', '', window.location.href.split('?')[0] + '?q=' + searchQuery.replace(/ +(?= )/g, '').split(" ").join("+") + '&share=' + Alpine.store('urlParams').shareID);
        }
    }

    // --- HOME page ---
    if (Alpine.store('pageParams').page == 'home') {
        // Fill search/List content accordingly
        fillSLContentAction()
    }

    // --- LIST page ---
    if (Alpine.store('pageParams').page == 'list') {
        // Fill mixed search/List content accordingly
        fillMXContentAction()
        Alpine.store('subscriptionsList').loadSubscriptionInfo(Alpine.store('authentication').host, Alpine.store('authentication').secretKey)
    }

}

// Theme toggled
function onThemeToggleEvent() {
    Alpine.store('pageParams').toggleTheme()
}

// Add to list button is pressed
function onSubscribeEvent(publicURL) {
    performSubscribeAction(publicURL)
}

// Remove from list button is pressed
function onUnSubscribeEvent(publicURL) {
    performUnSubscribeAction(publicURL)
}

// ----------------------------------- 4) Actions -----------------------------------------

// Fill in search/list content
function fillSLContentAction() {
    /* 
    Behaviour of results on first page loading. 
    Cases:
    1. is a Personal URL
         1.a. without search query
         1.b. with search query
    2. is a Public URL
         1.a. without search query
         1.b. with search query 
    */
    if (Alpine.store('urlParams').shareID == null) {
        if (!Alpine.store('urlParams').queryText) {
            // list items
            performListAction(Alpine.store('authentication').host, Alpine.store('authentication').secretKey, Alpine.store('urlParams').shareID)
        } else {
            // search items
            performSearchAction(Alpine.store('authentication').host, Alpine.store('authentication').secretKey, Alpine.store('urlParams').queryText, Alpine.store('urlParams').shareID)
        }
    } else {
        if (!Alpine.store('urlParams').queryText) {
            // list items
            performListAction(Alpine.store('authentication').host, Alpine.store('urlParams').shareID, Alpine.store('urlParams').shareID)
        } else {
            // search items
            performSearchAction(Alpine.store('authentication').host, Alpine.store('urlParams').shareID, Alpine.store('urlParams').queryText, Alpine.store('urlParams').shareID)
        }
    }
}

// Search items
function performSearchAction(host, key, query, isPublic) {
    // change title
    document.title = query + " - Aquila Search"

    // manage paging
    Alpine.store('listedResults').nextPage = 2
    nr = Alpine.store('listedResults').resultsPerPage

    if (isPublic) {
        searchPublicAPI(host, key, query, 1, nr)
            .then(result => {
                Alpine.store('listedResults').results = result
            })
    } else {
        searchPrivateAPI(host, key, query, 1, nr)
            .then(result => {
                Alpine.store('listedResults').results = result
            })
    }
}

// List items
function performListAction(host, key, isPublic) {
    // change title
    document.title = "Aquila | Search Bookmarks..."

    // manage paging
    Alpine.store('listedResults').nextPage = 2
    nr = Alpine.store('listedResults').resultsPerPage

    if (isPublic) {
        listPublicAPI(host, key, 1, nr)
            .then(result => {
                Alpine.store('listedResults').results = result
            })
    } else {
        listPrivateAPI(host, key, 1, nr)
            .then(result => {
                Alpine.store('listedResults').results = result
            })
    }
}

// Fill in mixed search/list content
function fillMXContentAction() {
    // Allow searching through all subscriptions

    if (!Alpine.store('urlParams').queryText) {
        // list items
        performMXListAction(Alpine.store('authentication').host, Alpine.store('authentication').secretKey)
    } else {
        // search items
        performMXSearchAction(Alpine.store('authentication').host, Alpine.store('authentication').secretKey, Alpine.store('urlParams').queryText)
    }
}

// Search items
function performMXSearchAction(host, key, query) {
    // change title
    document.title = query + " - Aquila List Search"

    // manage paging
    Alpine.store('listedResults').nextPage = 2
    nr = Alpine.store('listedResults').resultsPerPage

    searchPrivateAPI(host, key, query, 1, nr)
        .then(result => {
            Alpine.store('listedResults').results = result
        })
}

// List items
function performMXListAction(host, key) {
    // change title
    document.title = "Aquila | Search List..."

    // manage paging
    Alpine.store('listedResults').nextPage = 2
    nr = Alpine.store('listedResults').resultsPerPage

    listPrivateAPI(host, key, 1, nr)
        .then(result => {
            Alpine.store('listedResults').results = result
        })
}

// Subscribe to a public URL
function performSubscribeAction(publicURL) {
    host = Alpine.store('authentication').host
    secretKey = Alpine.store('authentication').secretKey
    userSubscribeAPI(host, secretKey, publicURL)
        .then(result => { })
}

// Unsubscribe from a public URL
function performUnSubscribeAction(publicURL) {
    host = Alpine.store('authentication').host
    secretKey = Alpine.store('authentication').secretKey
    userUnSubscribeAPI(host, secretKey, publicURL)
        .then(result => { })
}

// Check subscription to a public URL
async function userIsSubscribedAction(publicURL) {
    host = Alpine.store('authentication').host
    secretKey = Alpine.store('authentication').secretKey
    subStatus = await userIsSubscribedAPI(host, secretKey, publicURL)
        .then(result => {
            if (result.success && result.isSubscribed.length > 0) {
                return true
            } else {
                return false
            }
        })

    return subStatus
}

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

// Alpine initialized succesfully
document.addEventListener('alpine:init', () => {
    // Initialize all Alpine datastructures (Alpine Store)
    initURLParams()
    initAuthentication()
    initProfileInformation()
    initSearchInput()
    initSearchResults()
})

// Webpage is loaded and ready
window.onload = function () {
    // initialize url params on load
    Alpine.store('urlParams').loadURLParams()
    // initialize user by performing authentication on load
    Alpine.store('authentication').authenticate()

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
        if (Alpine.store('urlParams').queryText == null) {
            // list items for page 1
            Alpine.store('listedResults').nextPage = 2
            nr = Alpine.store('listedResults').resultsPerPage
            Alpine.store('listedResults').results = listPrivateAPI("", 1, nr)
        } else {
            // search items for page 1
            Alpine.store('listedResults').nextPage = 2
            nr = Alpine.store('listedResults').resultsPerPage
            Alpine.store('listedResults').results = searchPrivateAPI("", Alpine.store('urlParams').queryText, 1, nr)
        }
    } else {
        if (Alpine.store('urlParams').queryText == null) {
            // list items for page 1
            Alpine.store('listedResults').nextPage = 2
            nr = Alpine.store('listedResults').resultsPerPage
            Alpine.store('listedResults').results = listPublicAPI("", 1, nr)
        } else {
            // search items for page 1
            Alpine.store('listedResults').nextPage = 2
            nr = Alpine.store('listedResults').resultsPerPage
            Alpine.store('listedResults').results = searchPublicAPI("", Alpine.store('urlParams').queryText, 1, nr)
        }
    }


}

// ----------------------------- 1) Configure Alpine datastructures --------------------------------------------------

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
        authenticate() {

            // get secret key from addon
            addonData = fetchSecretADDON()
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
                .then(result => console.log(result))
        },
        user: null
    })
}

function initProfileInformation() {
    // Get profile information for any public profile given the ID
    Alpine.store('profileInfo', {
        get(shareID) {
            // call API to get data for a profile with ShareID

            return fetchProfileAPI("", "")
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
            this.results = []
        },
        results: [],
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

// ----------------------------------- 2) API calls to addon / server -----------------------------------------

function fetchSecretADDON() {
    secretKey = null

    try {
        if (chrome && chrome.runtime) {
            chrome.runtime.sendMessage(chromeExtensionID, {},
                function (response) {
                    if (response && response.success) {
                        secretKey = response.key
                    }
                    else {
                        secretKey = localStorage.getItem("axapi")
                    }
                }
            )
        }
        else {
            secretKey = localStorage.getItem("axapi")
        }
    }
    catch (e) {
        secretKey = localStorage.getItem("axapi")
    }

    return {
        host: "https://x.aquila.network",
        secretKey: "SR5Akwx21626763430" // secretKey // TBD: change later
    }
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

    let response = await fetch(host + "/api/user", requestOptions)
        .then((response) => response.json())
        .catch((error) => {

        })

    if (response) {
        return {
            name: response.user[0].name,
            rating: 4,
            avatar: "https://api.lorem.space/image/face?hash=92310",
            description: "Wei Dailey does some cool stuff. A developer by day, shitposter by night, and a Bitcoiner for life.", // response.user[0].title // TODO
            publicURL: "sd231sd2sdss412sd342s3s52s35fsdtgsdg"
        }
    } else {
        return false
    }

    return {
        name: "May Jonnes",
        rating: 4,
        avatar: "https://api.lorem.space/image/face?hash=92310",
        description: "Wei Dailey does some cool stuff. A developer by day, shitposter by night, and a Bitcoiner for life.",
        publicURL: "sd231sd2sdss412sd342s3s52s35fsdtgsdg"
    }
}

function fetchProfileAPI(host, publicID) {
    return {
        name: "Wei Dailey",
        rating: 4,
        avatar: "https://api.lorem.space/image/face?hash=92310",
        description: "Wei Dailey does some cool stuff. A developer by day, shitposter by night, and a Bitcoiner for life.",
        publicURL: "sd231sd2sdss412sd342s3s52s35fsdtgsdg"
    }
}

function listPrivateAPI(host, page, noItems) {
    return [
        {
            title: "I'm a simple private list title 1",
            url: "https://google.com",
            description: "If a dog chews shoes whose shoes does he choose? If a dog chews shoes whose shoes does he choose? If a dog chews shoes whose shoes does he choose?",
            timestamp: 123456789,
            author: "John Smith",
            website: "medium.com"
        },
        {
            title: "I'm a simple private list title 2",
            url: "https://google.com",
            description: "If a dog chews shoes whose shoes does he choose? If a dog chews shoes whose shoes does he choose? If a dog chews shoes whose shoes does he choose?",
            timestamp: 123456789,
            author: "John Smith",
            website: "medium.com"
        }
    ]
}

function searchPrivateAPI(host, query, page, noItems) {
    return [
        {
            title: "I'm a simple private search title 1",
            url: "https://google.com",
            description: "If a dog chews shoes whose shoes does he choose? If a dog chews shoes whose shoes does he choose? If a dog chews shoes whose shoes does he choose?",
            timestamp: 123456789,
            author: "John Smith",
            website: "medium.com"
        },
        {
            title: "I'm a simple private search title 2",
            url: "https://google.com",
            description: "If a dog chews shoes whose shoes does he choose? If a dog chews shoes whose shoes does he choose? If a dog chews shoes whose shoes does he choose?",
            timestamp: 123456789,
            author: "John Smith",
            website: "medium.com"
        }
    ]
}

function listPublicAPI(host, publicID, page, noItems) {
    return [
        {
            title: "I'm a simple public list title 1",
            url: "https://google.com",
            description: "If a dog chews shoes whose shoes does he choose? If a dog chews shoes whose shoes does he choose? If a dog chews shoes whose shoes does he choose?",
            timestamp: 123456789,
            author: "John Smith",
            website: "medium.com"
        },
        {
            title: "I'm a simple public list title 2",
            url: "https://google.com",
            description: "If a dog chews shoes whose shoes does he choose? If a dog chews shoes whose shoes does he choose? If a dog chews shoes whose shoes does he choose?",
            timestamp: 123456789,
            author: "John Smith",
            website: "medium.com"
        }
    ]
}

function searchPublicAPI(host, publicID, query, page, noItems) {
    return [
        {
            title: "I'm a simple public search title 1",
            url: "https://google.com",
            description: "If a dog chews shoes whose shoes does he choose? If a dog chews shoes whose shoes does he choose? If a dog chews shoes whose shoes does he choose?",
            timestamp: 123456789,
            author: "John Smith",
            website: "medium.com"
        },
        {
            title: "I'm a simple public search title 2",
            url: "https://google.com",
            description: "If a dog chews shoes whose shoes does he choose? If a dog chews shoes whose shoes does he choose? If a dog chews shoes whose shoes does he choose?",
            timestamp: 123456789,
            author: "John Smith",
            website: "medium.com"
        }
    ]
}

function correctAPI(host, secretKey, query, url, itemID) {
    return true
}

// ----------------------------------- 3) Event listeners & actions -----------------------------------------

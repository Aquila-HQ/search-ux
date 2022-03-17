console.log("Welcome to Aquila Network")

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
    Alpine.store('authentication').loadUserInfo()

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

            // get authentication status from API
            this.isAuthenticated = !this.isAuthenticated
        },
        isAuthenticated: false,
        loadUserInfo() {
            // get user information from API
        },
        user: {
            name: "Wei Dailey",
            rating: 4,
            avatar: "https://api.lorem.space/image/face?hash=92310",
            description: "Wei Dailey does some cool stuff. A developer by day, shitposter by night, and a Bitcoiner for life.",
            publicURL: "sd231sd2sdss412sd342s3s52s35fsdtgsdg"
        }
    })
}

function initProfileInformation() {
    // Get profile information for any public profile given the ID
    Alpine.store('profileInfo', {
        get(shareID) {
            // call API to get data for a profile with ShareID
            
            return {
                name: "Wei Dailey",
                rating: 4,
                avatar: "https://api.lorem.space/image/face?hash=92310",
                description: "Wei Dailey does some cool stuff. A developer by day, shitposter by night, and a Bitcoiner for life.",
                publicURL: "sd231sd2sdss412sd342s3s52s35fsdtgsdg"
            }
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
    // configure & cache search results for a personal search, public search & aggregated search separately
    Alpine.store('personalResults', {
        resett() {
            this.results = []
        },
        results: [
            {
                "title": "I'm a simple link title 1",
                "url": "https://google.com",
                "description": "If a dog chews shoes whose shoes does he choose? If a dog chews shoes whose shoes does he choose? If a dog chews shoes whose shoes does he choose?",
                "timestamp": 123456789,
                "author": "John Smith",
                "website": "medium.com"
            },
            {
                "title": "I'm a simple link title 2",
                "url": "https://google.com",
                "description": "If a dog chews shoes whose shoes does he choose? If a dog chews shoes whose shoes does he choose? If a dog chews shoes whose shoes does he choose?",
                "timestamp": 123456789,
                "author": "John Smith",
                "website": "medium.com"
            }
        ],
        resultsPerPage: 10,
        currentPage: 1
    })

    Alpine.store('publicResults', {
        resett() {
            this.results = []
        },
        results: [
            {
                "title": "I'm a simple link title 1",
                "url": "https://google.com",
                "description": "If a dog chews shoes whose shoes does he choose? If a dog chews shoes whose shoes does he choose? If a dog chews shoes whose shoes does he choose?",
                "timestamp": 123456789,
                "author": "John Smith",
                "website": "medium.com"
            },
            {
                "title": "I'm a simple link title 2",
                "url": "https://google.com",
                "description": "If a dog chews shoes whose shoes does he choose? If a dog chews shoes whose shoes does he choose? If a dog chews shoes whose shoes does he choose?",
                "timestamp": 123456789,
                "author": "John Smith",
                "website": "medium.com"
            }
        ],
        resultsPerPage: 10,
        currentPage: 1
    })

    Alpine.store('mixedResults', {
        resett() {
            this.results = []
        },
        results: [
            {
                "title": "I'm a simple link title 1",
                "url": "https://google.com",
                "description": "If a dog chews shoes whose shoes does he choose? If a dog chews shoes whose shoes does he choose? If a dog chews shoes whose shoes does he choose?",
                "timestamp": 123456789,
                "author": "John Smith",
                "website": "medium.com"
            },
            {
                "title": "I'm a simple link title 2",
                "url": "https://google.com",
                "description": "If a dog chews shoes whose shoes does he choose? If a dog chews shoes whose shoes does he choose? If a dog chews shoes whose shoes does he choose?",
                "timestamp": 123456789,
                "author": "John Smith",
                "website": "medium.com"
            }
        ],
        resultsPerPage: 10,
        currentPage: 1
    })
}

// ----------------------------------- 2) API calls to addon / server -----------------------------------------

function fetchSecretADDON (addonKey) {

}

function AuthenticateAPI (host, secretKey) {

}

function fetchUserAPI (host, secretKey) {

}

function fetchProfileAPI (host, publicID) {

}

function listAPI (host, publicID, page, noItems) {

}

function searchAPI (host, publicID, query, page, noItems) {

}

function correct (host, secretKey, query, url, itemID) {

}

// ----------------------------------- 3) Event listeners & actions -----------------------------------------

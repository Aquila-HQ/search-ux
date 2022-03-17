console.log("Welcome to Aquila Network")

window.onload = function () {
    // initialize everything

}

// init alpine data stores
document.addEventListener('alpine:init', () => {
    initAuthentication()
    initSearchResults()
})

function initAuthentication() {
    Alpine.store('authentication', {
        authenticate() {

            // get secret key from addon

            // get authentication status from API
            this.isAuthenticated = ! this.isAuthenticated
        },
        isAuthenticated: true
    })
}

function initSearchResults() {

    Alpine.store('personalResults', {
        resett() {
            this.results = [
                {
                    "title": "I'm a simple link title reset",
                    "url": "https://google.com",
                    "description": "If a dog chews shoes whose shoes does he choose? If a dog chews shoes whose shoes does he choose? If a dog chews shoes whose shoes does he choose?",
                    "timestamp": 123456789,
                    "author": "John Smith",
                    "website": "medium.com"
                }
            ]
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
        ]
    })
}


tailwind.config = {
    theme: {
        extend: {
            colors: {
                clifford: '#da373d',
            }
        }
    }
}

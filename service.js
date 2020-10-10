const url = 'https://ocean.free.beeceptor.com';




export function getFeatures() {
    const param = {
        headers: {
            "content-type": "application/json; charset=UTF-8"
        },
        method: "GET"
    }

    fetch(url, param)
        .then(res => console.log(res))
        .catch(error => console.log(error))
}


export function sendFeatures(data) {
    const param = {
        headers: {
            "content-type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify(data),
        method: "POST"
    }

    fetch(url, param)
        .then(res => console.log(res))
        .catch(error => console.log(error))
}

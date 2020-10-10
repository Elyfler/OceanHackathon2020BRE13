import 'regenerator-runtime/runtime'

const url = 'http://localhost:5000/api/db';




export async function getFeatures() {
    const param = {
        headers: {
            "content-type": "application/json; charset=UTF-8; ",
            "Access-Control-Allow-Origin":"*"
        },
        method: "GET"
    }

    let response = await fetch(url, param)
    let data = await response.json()
    return data;
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

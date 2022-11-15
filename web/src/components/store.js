import { writable, derived, readable } from 'svelte/store';

export const botList = writable([]);
export const serverOnline = writable(false);
export const enums = writable();

export const sendRequest = (uri, method, content) => {
    let xhrMethod = method ?? 'GET';

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(xhrMethod, `/api/${uri}`, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    resolve(JSON.parse(xhr.response));
                }
                else if (xhr.status >= 400 && xhr.status < 600) {
                    reject(JSON.parse(xhr.response).error);
                }
            }
        };
        xhr.onerror = (e) => {
            reject("Unknown Error Occured. Server response not received.");
        };
        xhr.send(JSON.stringify(content));
    });
};

export const randomColor = () => Math.floor(Math.random() * 16777215).toString(16);

export const randomColorClass = () => ['red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose'][Math.floor(Math.random() * 17)];

export const transformMsToMin = (milli) => Math.floor(milli / 1000 / 60);

export const secondsToDDHHMMSS = (seconds) => {
    if (seconds == null || Number.isNaN(seconds)) return "N/A";
    seconds = Number(seconds);
    var d = Math.floor(seconds / (3600 * 24));
    var h = Math.floor((seconds % (3600 * 24)) / 3600);
    var m = Math.floor((seconds % 3600) / 60);
    var s = Math.floor(seconds % 60);

    var dDisplay = d > 0 ? d + "D " : "";
    var hDisplay = h > 0 ? h.toString().padStart(2, 0) + " H   " : "";
    var mDisplay = m > 0 ? m.toString().padStart(2, 0) + " M " : "";
    var sDisplay = s.toString().padStart(2, 0) + " S";
    return dDisplay + hDisplay + mDisplay + sDisplay;
}

export const initTimer = () => {
    setInterval(() => {
        getCurrentBot();
    }, 1000);
};

let getCurrentBot = () => {
    sendRequest('currentBot').then(x => {
        serverOnline.set(true);
        botList.set(x.bots);
    }).catch(err => {
        serverOnline.set(false);
        console.error(err);
    });
};

let getEnums = () => {
    sendRequest('enums').then(x => {
        enums.set(x.enums);
    }).catch(err => {
        console.error(err);
    });
};

getEnums();
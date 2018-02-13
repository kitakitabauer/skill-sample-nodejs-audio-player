'use strict';

let ja = {
    card : {
        title: 'AWAステーション',
        subtitle: 'AWAステーションではランキング、ジャンル、オススメ、お気に入りの音楽などを流せます。',
        cardContent: "https://awa.fm",
        image: {
            largeImageUrl: 'https://s3-ap-northeast-1.amazonaws.com/alexa.awa.fm/skills/awa/assets/icon/AWA-logo-108.png',
            smallImageUrl: 'https://s3-ap-northeast-1.amazonaws.com/alexa.awa.fm/skills/awa/assets/icon/AWA-logo-512.png'
        }
    },
    url: 'https://audio1.maxi80.com',
    startJingle : 'https://s3.amazonaws.com/alexademo.ninja/maxi80/jingle.m4a'
};

let globalAudioData = {
    'ja-JP': ja,
};

function audioData(request) {
    let DEFAULT_LOCALE = 'ja-JP';
    var locale = request === undefined ? DEFAULT_LOCALE : request.locale;
    if (locale === undefined) {
        locale = DEFAULT_LOCALE
    };
    return globalAudioData[locale];
}

module.exports = audioData;

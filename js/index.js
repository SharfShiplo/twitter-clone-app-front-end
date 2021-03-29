const URL = "http://localhost:3000/tweets";
let nextPageUrl = null;
const onEnter = (e) => {
    if (e.key == 'Enter') {
        getTwitterData();
    }
}
const onNextPage = () => {
    if (nextPageUrl) {
        getTwitterData(true)
    }
}
/**
 * Retrive Twitter Data from API
 */
const getTwitterData = (nextPage = false) => {
    const query = document.querySelector('#searchInput').value;
    if (!query) return;
    const encodedQuery = encodeURIComponent(query)
    let fullUrl = `${URL}?q=${encodedQuery}&count=10`;
    if (nextPage && nextPageUrl) {
        fullUrl = nextPageUrl;
    }
    fetch(fullUrl).then((response) => response.json()).then((data) => {
        buildTweets(data.statuses, nextPage);
        saveNextPage(data.search_metadata);
        nextPageButtonVisibility(data.search_metadata);
    }).catch((error) => alert(error));
}
/**
 * Save the next page data
 */
const saveNextPage = (metadata) => {
    if (metadata.next_results) {
        nextPageUrl = `${URL}${metadata.next_results}`;
    } else {
        nextPageUrl = null;
    }
}
/**
 * Handle when a user clicks on a trend
 */
const selectTrend = (e) => {
    const text = e.innerText;
    document.querySelector('#searchInput').value = text;
    getTwitterData();
}
/**
 * Set the visibility of next page based on if there is data on next page
 */
const nextPageButtonVisibility = (metadata) => {
    if (metadata.next_results) {
        document.querySelector('.tweet-nextButton').style.visibility = "visible";
    } else {
        document.querySelector('.tweet-nextButton').style.visibility = "hidden";
    }
}
/**
 * Build Tweets HTML based on Data from API
 */
const buildTweets = (tweets, nextPage) => {
    let tweetContent = "";
    tweets.map((tweet) => {
        const createdDate = moment(tweet.created_at).fromNow()
        tweetContent += `
        <div class="tweet-container">
                    <div class="tweet-info">
                        <div class="tweet-infoImage" style="background-image: url(${tweet.user.profile_image_url_https})"></div>
                        <div class="tweet-infoName">
                            <h3>${tweet.user.name}</h3>
                            <p>@${tweet.user.screen_name}</p>
                        </div>
                    </div>`
        if (tweet.extended_entities
            && tweet.extended_entities.media
            && tweet.extended_entities.media.length > 0) {
            tweetContent += buildImages(tweet.extended_entities.media);
            tweetContent += buildVideo(tweet.extended_entities.media);
        }
        tweetContent += `<div class="tweet-textContent">
                        <p>${tweet.full_text}</p>
                        <span>${createdDate}</span>
                    </div>
                </div>
        `
    })
    if (nextPage) {
        document.querySelector('.tweets-lists').insertAdjacentHTML('beforeend', tweetContent);
    } else {
        document.querySelector(".tweets-lists").innerHTML = tweetContent;
    }
}
/**
 * Build HTML for Tweets Images
 */
const buildImages = (mediaList) => {
    let imageContent = `<div class="tweet-media-image">`;
    let imageExist = false;
    mediaList.map((media) => {
        if (media.type == "photo") {
            imageExist = true;
            imageContent += `
                <div class="tweet-image" style="background-image: url(${media.media_url_https})"></div>
            `
        }

    })
    imageContent += `</div>`;
    return (imageExist ? imageContent : '');

}
/**
 * Build HTML for Tweets Video
 */
const buildVideo = (mediaList) => {
    let videoContent = `<div class="tweet-video-container">`;
    let videoExist = false;
    mediaList.map((media) => {
        if (media.type == "video") {
            videoExist = true;
            const videoVariant = media.video_info.variants.find((variant) => variant.content_type == 'video/mp4')
            videoContent += `
            <video controls>
            <source
            src="${videoVariant.url}"
            type="video/mp4">
            </video>
            `
        } else if (media.type == 'animated_gif') {
            videoExist = true;
            const videoVariant = media.video_info.variants.find((variant) => variant.content_type == 'video/mp4')
            videoContent += `
            <video loop autoplay>
            <source
                src="${videoVariant.url}"
                type="video/mp4">
        </video>
            `
        }

    })
    videoContent += `</div>`;
    return (videoExist ? videoContent : '');
}
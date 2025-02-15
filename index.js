import { tweetsData } from "./data.js";
import { v4 as uuidv4 } from 'https://jspm.dev/uuid';

document.getElementById('new-tweet-btn').addEventListener('click', function() {
    handleTweetBtnClick()
})

document.addEventListener('click', function(e) {
    if(e.target.dataset.like) {
        handleLikeClick(e.target.dataset.like)
    } else if (e.target.dataset.retweet) {
        handleRetweetClick(e.target.dataset.retweet)
    } else if (e.target.dataset.menu) {
        handleMenuClick(e.target.dataset.menu)
    } else if (e.target.dataset.deleteBtn) {
        handleDeleteClick(e.target.dataset.deleteBtn)
    }
})

function handleTweetBtnClick() {
    const newTweetContainer = document.getElementById('new-tweet-input')
    newTweetContainer.classList.remove('display-none')
    document.getElementById('cancel-btn').addEventListener('click', function(){
        newTweetContainer.classList.add('display-none')
    })

    const tweetBtn = document.getElementById('tweet-btn')
    const tweetInput = document.getElementById('tweet-input')
    document.addEventListener('keydown', function() {
        if (tweetInput.value) {
            tweetBtn.disabled = false
        } else {
            tweetBtn.disabled = true
        }
    })

    tweetBtn.addEventListener('click', function() {
        if(!tweetBtn.disabled && tweetInput.value) {
            tweetsData.unshift({
                name: 'Manuel Banchero',
                handle: '@manu_banchero',
                profilePic: 'images/manu-banchero.jpg',
                tweetedDate: '2/21/20',
                tweetedAt: '09:28',
                tweetedFrom: 'Twitter Web App',
                likes: 0,
                retweets: 0,
                tweetText: tweetInput.value,
                isLiked: false,
                isRetweeted: false,
                uuid: uuidv4(),
                followingLikes: [],
                followingRetweet: [],
                isVerified: true,
                replies: []
            })

            tweetInput.value = ''
            newTweetContainer.classList.add('display-none')
            updateDB(tweetsData[0])
            render()
        }
    })
}

function handleLikeClick(tweetId) {
    const targetedTweetObj = getFromDB(tweetId)
    if (targetedTweetObj.isLiked) {
        targetedTweetObj.likes--
    } else {
        targetedTweetObj.likes++
    }
    targetedTweetObj.isLiked = !targetedTweetObj.isLiked
    updateDB(targetedTweetObj)
    render()
}

function handleRetweetClick(tweetId) {
    const targetedTweetObj = getFromDB(tweetId)
    if(targetedTweetObj.isRetweeted) {
        targetedTweetObj.retweets--
    } else {
        targetedTweetObj.retweets++
    }
    targetedTweetObj.isRetweeted = !targetedTweetObj.isRetweeted
    updateDB(targetedTweetObj)
    render()
}

function handleMenuClick(tweetId) {
    const menuIcon = document.getElementById(tweetId)
    menuIcon.firstElementChild.classList.toggle('display-none')
}

function handleDeleteClick(tweetId) {
    const index = tweetsData.findIndex(function(tweet){
        return tweet.uuid === tweetId
    })
    if (index !=- -1) {
        tweetsData.splice(index, 1)
    }
    removeFromDB(tweetId)
    render()
}

function getFromDB(id) {
    return JSON.parse(localStorage.getItem(id))
}

function updateDB(element) {
    localStorage.setItem(element.uuid, JSON.stringify(element))
}

function removeFromDB(id) {
    localStorage.removeItem(id)
}

function render() {
    const feed = document.getElementById('tweets-feed')
    let feedHtml = ''
    tweetsData.forEach(function(tweet) {
        if (getElementFromDB(tweet.uuid)) { // si el elemento existe en la DB
            feedHtml += getTweetHtml(getElementFromDB(tweet.uuid))
        }
    })
    feed.innerHTML = feedHtml
}

function getElementFromDB(id) {
    return JSON.parse(localStorage.getItem(id))
}

function getTweetHtml(tweet) {
    const verified = getVerfiedHTML(tweet)
    const followingInteraction = getFollowingInteractionHtml(tweet)
    const followingInteractionIcon = getFollowingInteractionIcon(tweet)
    const likes = getDetails(tweet.likes)
    const retweets = getDetails(tweet.retweets)
    const threadProfileImg = getThreadProfileImg(tweet)
    const thread = getThreadHtml(tweet)
    const isLikedClass = getIsLikedClass(tweet.isLiked)
    const heartClass = gerHeartClass(tweet.isLiked)
    const isRetweetedClass = getRetweetedClass(tweet.isRetweeted)
    return `
        <div class="tweet-container">
                <div class="tweet">
                    <div class="user-profile-container gray-font">
                        ${followingInteractionIcon}
                        <img class="profile-img bigger" src="${tweet.profilePic}" alt="">
                        ${threadProfileImg}
                    </div>
                    <div class="info-tweet">
                        ${followingInteraction}
                        <div class="user-data">
                            <span class="bold-font">
                                ${tweet.name}
                                ${verified}
                            </span>
                            <span class="gray-font">${tweet.handle}</span>
                            <span class="gray-font">.3h</span>
                            <i class="fa-solid fa-chevron-down gray"
                                data-menu="${tweet.uuid}"
                                id="${tweet.uuid}"
                            >
                                <div class="delete-tweet-container display-none">
                                    <button class="tweet-btn" data-delete-btn="${tweet.uuid}">
                                        <i class="fa-regular fa-trash-can"></i>
                                        Delete Tweet
                                </button>
                            </div>
                            </i>
                            
                        </div>
                        <p class="tweet-text">
                            ${tweet.tweetText}
                        </p>
                        <div class="tweet-details gray-font">
                            <span class="tweet-detail" data-comment="${tweet.uuid}">
                                <i class="fa-regular fa-comment"></i>
                                ${tweet.replies.length}
                            </span>
                            <span class="tweet-detail ${isRetweetedClass}" >
                                <i class="fa-solid fa-retweet" data-retweet="${tweet.uuid}"></i>
                                ${retweets}
                            </span>
                            <span class="tweet-detail ${isLikedClass}">
                                <i class="fa-heart ${heartClass}" data-like="${tweet.uuid}"></i>
                                ${likes}
                            </span>
                            <span class="tweet-detail">
                                <i class="fa-solid fa-arrow-up-from-bracket"></i>
                            </span>
                        </div>
                        ${thread}
                    </div>
                </div>
            </div>
    `
}

function getVerfiedHTML(tweet) {
    let verified = ''
    if(tweet.isVerified) {
        verified = `
            <span class="verified">
                <i class="fa-solid fa-certificate blue"></i>
                <i class="fa-solid fa-check"></i>
            </span>`
    }
    return verified
}

function getFollowingInteractionHtml(tweet) {
    let interactionHtml = ''
    if (tweet.followingRetweet.length > 0) {
        interactionHtml = `
            <div class="following-interaction gray-font">
                <span>${tweet.followingRetweet[0].name} Retweeted</span>
            </div>
        `
    } else if(tweet.followingLikes.length === 1) {
        interactionHtml = `
            <div class="following-interaction gray-font">
                <span>${tweet.followingLikes[0].name} liked</span>
            </div>
        `
    } else if (tweet.followingLikes.length > 1) {
        interactionHtml = `
            <div class="following-interaction gray-font">
                <span>${tweet.followingLikes[0].name} and ${tweet.followingLikes[1].name} liked</span>
            </div>
        `
    }
    return interactionHtml
}

function getFollowingInteractionIcon(tweet) {
    let interactionIcon = ''
    if (tweet.followingRetweet.length > 0) {
        interactionIcon = `
            <i class="fa-solid fa-retweet"></i>
        `
    } else if (tweet.followingLikes.length > 0) {
        interactionIcon = `
            <i class="fa-solid fa-heart"></i>
        `
    }
    return interactionIcon
}

function getThreadProfileImg(tweet) {
    let threadProfileImg = ''
    if (tweet.replies.length > 0) {
        const userSelfReplie = tweet.replies.filter(function(replie) {
            return replie.name === tweet.name
        })
        if (userSelfReplie.length != 0) {
            threadProfileImg = `
                <div class="line"></div>
                <img src="${tweet.profilePic}" alt="" class="profile-img thread-img">
            `
        }
    }
    return threadProfileImg
}

function getThreadHtml(tweet) {
    let thread = ''
    if (tweet.replies.length > 0) {
        const userSelfReplie = tweet.replies.filter(function(replie) {
            return replie.name === tweet.name
        })
        if (userSelfReplie.length != 0) {
            thread = `<p class="thread"><a href="#" class="blue">Show this thread</a></p>`
        }
    }
    return thread
}

function getDetails(detail) {
    detail = detail.toString()
    if (detail >= 10000 && detail < 100000) {
        return `${detail[0]}${detail[1]}K`
    } else if (detail >= 100000 && detail < 1000000) {
        return `${detail[0]}${detail[1]}${detail[2]}K`
    } else if (detail >= 1000000) {
        return `${detail[0]}M`
    }
    return detail
}

function gerHeartClass(isLiked) {
    if(isLiked) {
        return 'fa-solid'
    }
    return 'fa-regular'
}

function getIsLikedClass(isLiked) {
    if(isLiked) {
        return 'liked'
    }
    return ''
}

function getRetweetedClass(isRetweeted) {
    if(isRetweeted) {
        return 'retweeted'
    }
    return ''
}

function loadDB() {
    tweetsData.forEach(function(tweet) {
        localStorage.setItem(tweet.uuid, JSON.stringify(tweet))
    })
}

//loadDB()
render()

console.log(localStorage.key)
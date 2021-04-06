function getDateAndTime () {
    const date = new Date()
    return getDate(date) + getTime(date)
}

function getTime (date) {
    let hours = date.getHours()
    let mins = date.getMinutes()
    let secs = date.getSeconds()
    if (hours < 10) {
        hours = `0${hours}`
    }
    if (mins < 10) {
        mins = `0${mins}`
    }
    if (secs < 10) {
        secs = `0${secs}`
    }
    console.log(hours)
    console.log(mins)
    console.log(secs)
    return '' + hours + mins + secs
}

function getDate (date) {
    const year = date.getFullYear()
    let month = date.getMonth() + 1
    let day = date.getDate()
    if (month < 10) {
        month = `0${month}`
    }
    if (day < 10) {
        day = `0${day}`
    }
    return year + month + day
}

function getRandomStr () {
    const assiiNum0 = 48, // 0 assii值
        assiiUpA = 65, // A assii值
        assiiLowerA = 97 // a assii值
    // 生成ascii上从0到小写z直接所有的字符
    const arr = [0, 0, 0, 0, 0, 0].map(() => {
        const num = Number(Math.floor(Math.random() * 62)) // 大小写字母和数字序号
        let str = ''
        if (num < 10) { // 数字 0-9
            str = String.fromCharCode(assiiNum0 + num)
        } else if (num < 36) { // 大写字母 A-Z
            str = String.fromCharCode(assiiUpA + num - 10)
        } else { // 小写字母 a-z
            str = String.fromCharCode(assiiLowerA + num - 36)
        }
        return str
    })
    return arr.join('')
}

function getImgCodeToken () {
    return getDateAndTime() + getRandomStr()
}

export default getImgCodeToken
import axios from 'axios'

const interfaceArr = ['postFormApi', 'postJsonApi', 'postFileApi', 'getApi']

const interfaceApis = {}

for (let i = 0; i < interfaceArr.length; i++) {
    const interfaceApi = axios.create()

    // 添加请求拦截
    interfaceApi.interceptors.request.use(function (config) {
        localStorage.getItem('loginToken') && (config.headers.token = localStorage.getItem('loginToken'))
        // Do something before request is sent
        return config
    }, function (error) {
        // Do something with request error
        return Promise.reject(error)
    })

    // 添加响应拦截
    interfaceApi.interceptors.response.use(function (response) {
        console.log(response);
        if (response.data.code === 10004) {
            localStorage.removeItem('loginToken')
            location.reload()
        }
        // Do something with response data
        return response
    }, function (error) {
        // Do something with response error
        return Promise.reject(error)
    })

    if (interfaceArr[i] === 'postFormApi') {
        interfaceApi.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'
    } // form表单数据请求头处理

    if (interfaceArr[i] === 'postFileApi') {
        interfaceApi.defaults.headers.post['Content-Type'] = 'multipart/form-data'
    } // form表单数据包含二进制文件请求头处理

    // 暂时只对post和get请求做了处理
    interfaceApis[interfaceArr[i]] = interfaceArr[i].indexOf('post') !== -1 ? interfaceApi.post : interfaceApi.get
}

/**
 * getApi: get请求
 * postFileApi: post请求（form表单包含上传二进制文件数据）
 * postFormApi: post请求（form表单）
 * postJsonApi: post请求（JSON）
 */
export default interfaceApis
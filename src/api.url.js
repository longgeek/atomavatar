/**
 * For API list settings
 */
var API_URL = process.env.VUE_APP_APIURL;

export default {
    oauth: {
        authorize:                  ()      => { return API_URL + '/oauth/authorize' },
    },
    login: {
        changePassword:             ()      => { return API_URL + '/users/login/changePassword' },
        loginByPassword:            ()      => { return API_URL + '/client/login/loginByPassword' },
    },
    captcha: {
        getImage:                   (token) => { return API_URL + `/client/captcha/getImage?captchaToken=${token}` },
    },
    register: {
        getEmailCode:               ()      => { return API_URL + '/client/register/getEmailCode' },
        getPhoneCode:               ()      => { return API_URL + '/client/register/getPhoneCode' },
        registerByEmailCode:        ()      => { return API_URL + '/client/register/registerByEmailCode' },
        registerByPhoneCode:        ()      => { return API_URL + '/client/register/registerByPhoneCode' },
    },
}

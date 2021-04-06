/**
 * 用户登录组件
 */

import api from "@/api.config";
import axios from "axios";
import uuidv1 from "uuid/dist/v1";
import { required, minLength, maxLength } from "vuelidate/lib/validators";

const data = function() {
    return {
        login: {
            name: '',               // 手机号或邮箱
            password: '',           // 密码
            captcha: '',            // 图片验证码
        },
        loading: false,             // 控制提交按钮禁用
        submitted: false,           // 代表表单被提交
        errorMsg: '',               // 当表单有误时前端提醒文字

        // 图片验证码相关
        captcha: '',                // 图片验证码 <img> 的 :src 值
        captchaToken: '',
        captchaLoading: false,      // 用于点击更换图片验证码
        tokens: localStorage.getItem('logintoken'),
    }
};

const methods = {
    /*
     *  对手机号和邮箱判断
     */
    isPhone(v) { return /^[1][3,4,5,6,7,8][0-9]{9}$/.test(v) },
    isEmail(v) { return /.+@.+\..+/.test(v) },
    /*
     *  提交用户登录表单，用于验证输入格式是否有效
     */
    submit() {
        if (this.loading) return;

        this.loading = true;
        this.submitted = true;

        // 判断手机号或邮箱是否符合规范
        if (!this.isPhone(this.login.name) && !this.isEmail(this.login.name)) {
            this.errorMsg = '输入的手机号或邮箱格式有误，请重新输入';
            this.loading = false;
            return;
        }

        // 判断表单是否无效
        if (this.$v.login.$invalid) {
            // 根据表单错误项输出提示内容
            if (this.$v.login.name.$error) { this.errorMsg = '请输入手机号或邮箱' }
            else if (this.$v.login.password.$error) { this.errorMsg = '请输入密码' }
            else if (this.$v.login.captcha.$error) { this.errorMsg = '请输入 4 位图片验证码' }
            this.$v.$touch();
            this.loading = false;
            return;
        }

        // 输入格式验证成功
        this.errorMsg = false;

        // 调用 API 进行登录验证
        this.submitAPI();
    },
    /*
     *  用户登录方法
     *  登录成功后写入用户信息到 local Storage 中
     */
    submitAPI() {
        api.postJsonApi(
            this.__API__.login.loginByPassword(),
            {
                loginName: this.login.name,
                password: this.login.password,
                imageCode: this.login.captcha,
                captchaToken: this.captchaToken,
            }
        )
        .then((response) => {
            if (response.data.code === 200) {
                let user = JSON.stringify({
                    loginName: this.login.name,
                    nickname: response.data.data.nickname || this.login.name,
                    headImgUrl: response.data.data.headImageUrl,
                    roleTypes: response.data.data.roleTypes,
                });

                localStorage.setItem("userInfo", user);
                localStorage.setItem("logintoken", response.data.data.token);
                localStorage.setItem("userid", response.data.data.userId);
                localStorage.setItem("phone", response.data.data.phone);
                localStorage.setItem("email", response.data.data.email);
                localStorage.setItem("headImageUrl", response.data.data.headImageUrl);
                localStorage.setItem("nickname", response.data.data.nickname);

                this.$store.commit("setUserSession", user);
                this.$store.commit("setToken", response.data.data.token);

                // OIDC 方式
                if (this.$route.query.redirect_oidc) {
                    // api.postJsonApi(this.$route.query.redirect_oidc)
                    //     .then((response) => {
                    //         if (response.data.code !== 200) {
                    //             this.$bvToast.toast(response.data.msg, {
                    //                 title: 'OIDC 授权失败', variant: 'danger', toaster: 'b-toaster-bottom-right'
                    //             });
                    //             this.loading = false;
                    //             return;
                    //         }
                    //         this.$bvToast.toast(response.data.msg, {
                    //             title: 'OIDC', variant: 'primary', toaster: 'b-toaster-bottom-right'
                    //         });
                    //         this.loading = false;
                    //         return;
                    //     })
                    axios.post(
                        this.$route.query.redirect_oidc,
                        {},
                        {
                            headers: {
                                token: localStorage.getItem('logintoken'),
                                changeOrigin: true,
                                'Access-Control-Allow-Credentials': true
                            }
                        }
                    ).then(response =>{
                        if (response.data.code !== 200) {
                            this.$bvToast.toast(response.data.msg, {
                                title: 'OIDC 授权失败', variant: 'danger', toaster: 'b-toaster-bottom-right'
                            });
                            this.loading = false;
                            return;
                        }
                        this.$bvToast.toast(response.data.msg, {
                            title: 'OIDC', variant: 'primary', toaster: 'b-toaster-bottom-right'
                        });
                        this.loading = false;
                        return;
                    })
                } else {
                    // OAuth 方式
                    if (this.redirect) {
                        const opts = { path: this.redirectPath };
                        if (this.redirectQuery) opts.query = this.redirectQuery;
                        this.$router.push(opts);
                    } else {
                        window.location.href = '/#/personalCenter';
                    }
                }
                this.loading = false;
            } else {
                this.$bvToast.toast(response.data.msg, {
                    title: '登录失败', variant: 'danger', toaster: 'b-toaster-bottom-right'
                });
            }
            this.loading = false;
        })
        .catch((error) => {
            this.$bvToast.toast(error, {
                title: '登录失败', variant: 'danger', toaster: 'b-toaster-bottom-right'
            });
            this.loading = false;
        });
    },
    /*
     *  获取验证码图片
     */
    getCaptcha() {
        this.captchaLoading = true;
        this.captchaToken = uuidv1();
        this.captcha = this.__API__.captcha.getImage(this.captchaToken);
        this.__SLEEP__(100).then(() => {
            this.captchaLoading = false;
        })
    },
};

export default {
    data,
    methods,
    created() {
        this.getCaptcha();
    },
    mounted() {
        // // 自动 focus 输入框
        // this.$nextTick(() => {
        //     this.$refs.autofocus.focus();
        // }

        // Copy from 官网代码
        if (this.$route.query.redirect_oidc) return;

        const redirect = this.$route.query.redirect;
        if (!redirect) return;

        const splits = redirect.split("?");
        this.redirect = true;
        this.redirectPath = splits[0];
        if (splits.length > 1) {
            const querys = {};
            (decodeURIComponent(splits[1]).split("&") || []).forEach((str) => {
                const tmp = str.split("=");
                querys[tmp[0]] = tmp[1];
            });
            this.redirectQuery = querys;
            this.appName = querys.appName;

            if (querys.authorize === "success" || querys.authorize === "fail") {
                if (querys.authorize === "success" && querys.token) {
                    this.oauth(querys.token).then((res) => {
                        if (res.code === 200) {
                            this.$router.push({
                                path: this.redirectPath,
                                query: this.redirectQuery,
                            });
                            return;
                        }
                    });
                } else {
                    this.$bvToast.toast('授权失败', {
                        title: '提示', variant: 'danger', toaster: 'b-toaster-bottom-right'
                    });
                }
                return;
            }
        }
    },
    // form 表单验证
    validations: {
        login: {
            name: { required },
            password: { required },
            captcha: { required, maxLength: maxLength(4), minLength: minLength(4) },
        }
    },
};

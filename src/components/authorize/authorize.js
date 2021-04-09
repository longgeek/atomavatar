/**
 * 授权组件
 */

import axios from "axios";
import Cookie from "js-cookie";

const data = function() {
    return {
        responseType: "code",
        clientId: "",
        redirectUri: "",
        state: "",
        loading: false,
        appName: "",
        infos: "",
        tokens: localStorage.getItem('logintoken')
    }
};

const methods = {
    confirm() {
        if (this.loading) return;

        this.loading = true;

        // OIDC 方式
        if (this.$route.query.oidc_uid) {
            axios.post(`/atom_services/oidc/interaction/${this.$route.query.oidc_uid}/confirm`,
                {},
                {
                    headers: {
                        token: localStorage.getItem('logintoken'),
                        changeOrigin: true,
                        'Access-Control-Allow-Credentials': true
                    }
                }                
            )
                .then(res =>{
                    if (res.data.code !== 200) {
                        this.$bvToast.toast(res.data.msg, {
                            title: '授权失败', variant: 'danger', toaster: 'b-toaster-bottom-right'
                        });
                        this.loading = false;
                        return;
                    }
                    window.location.href = res.data.data.redirectTo
            })
        } else {
            // OAuth 方式
            Cookie.set(
                "clientToken",
                this.tokens,
                { expires: new Date(new Date().getTime() + 2000) }
            );

            axios.get(this.__API__.oauth.authorize(),
                {
                    params: {
                        response_type: this.responseType,
                        client_id: this.clientId,
                        redirect_uri: this.redirectUri,
                        state: this.state
                    },
                    headers: {
                        token: this.tokens,
                        changeOrigin: true,
                        'Access-Control-Allow-Credentials': true
                    }
                }
            ).then(res =>{
                if (res.data.code !== 200) {
                    this.$bvToast.toast(res.data.msg, {
                        title: '授权失败', variant: 'danger', toaster: 'b-toaster-bottom-right'
                    });
                    this.loading = false;
                    return;
                }
                window.location.href = res.data.data;
                this.loading = false;
            })
        }
    },
    cancel() {
        window.location.href = this.redirectUri;
    },
    init() {
        this.responseType = this.$route.query.response_type;
        this.clientId = this.$route.query.client_id;
        this.redirectUri = this.$route.query.redirect_uri;
        this.state = this.$route.query.state;
        this.appName = this.$route.query.app_name;
        this.infos = this.$route.query.scope &&
        this.$route.query.scope.split(",").map((info) => {
            switch (info) {
                case "0":
                    return "手机号";
                case "1":
                    return "昵称";
                case "2":
                    return "邮箱";
                case "3":
                    return "用户类型";
            }
        }).join("，");
    },
};

export default {
    data,
    methods,
    mounted() {
        if (this.token && !this.userId && this.tokens) {
            this.loading = true;
            this.getUserInfo().then(res => {
                this.loading = false;
                if (res.code === 200) {
                    this.init();
                } else {
                    this.$gmessage.error("获取用户信息失败，请重新登录");
                    this.push({
                        path: "/login",
                        query: { redirect: this.$route.fullPath }
                    });
                    return;
                }
            }).catch(() => {
                this.loading = false;
            })
        } else {
            this.init();
        }
    },
};

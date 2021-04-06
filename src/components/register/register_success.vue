<script>
/**
 *  用户注册成功页面
 */

const data = function() {
    return {
        timer: 5,
    }
};

export default {
    data,
    created() {
        this.__SLEEP__(5000).then(() => {
            this.$router.push({ name: 'login', query: this.$route.query });
        })
        setInterval(() => {
            this.timer -= 1;
        }, 1000);
    }
};
</script>

<template>
<div class="account-pages my-5 pt-5">
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-6 col-lg-5 col-sm-6">
                <div class="text-center mt-6">
                    <a href="/">
                        <div class="avatar-md profile-user-wid mb-4">
                            <span class="avatar-title rounded-circle bg-light">
                                <img
                                    alt="" height="76" class="rounded-circle"
                                    src="https://tvax3.sinaimg.cn/crop.0.0.360.360.180/008bei33ly8gilimvri1gj30a00a0mx4.jpg?KID=imgbed,tva&Expires=1616413750&ssig=t3GQPTvoW%2B"
                                />
                            </span>
                        </div>
                    </a>
                </div>
                <div class="text-center mt-2">
                    <h5>开放原子开源基金会</h5>
                </div>
                <div class="card overflow-hidden mt-8">
                    <div class="card-body pt-0 mt-8">
                        <h5 class="text-center text-primary mb-6">注册成功</h5>
                        <div role="alert" class="alert alert-primary text-center mb-4">
                            恭喜，您已成功注册开放原子开源基金会账号，<b>{{ timer }} </b>秒后会自动跳转到登录页面。
                        </div>
                    </div>
                </div>
                <div class="mt-11 text-center">
                    <p>
                        <router-link :to="{name: 'login', query: $route.query}">
                            <a class="font-weight-medium text-primary">去登录</a>
                        </router-link>
                    </p>
                    <p> © 2021 OpenAtom. </p>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

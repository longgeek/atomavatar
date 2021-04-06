import Vue from 'vue';
import VueRouter from 'vue-router';

import login from "@/components/login/login.vue";
import register from "@/components/register/register.vue";
import authorize from "@/components/authorize/authorize.vue";
import passwordReset from "@/components/password_reset/password_reset.vue";

Vue.use(VueRouter);

const routes = [
    { path: '/', redirect: 'login' },
    { path: '/login', name: 'login', component: login },
    { path: '/register', name: 'register', component: register },
    { path: '/authorize', name: 'authorize', component: authorize },
    { path: '/password_reset', name: 'password_reset', component: passwordReset },
]

export default new VueRouter({
    // mode: 'history',
    routes // (缩写) 相当于 routes: routes
})

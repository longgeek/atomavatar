import Vue from 'vue';
import VueRouter from 'vue-router';

import Login from "@/components/login/login.vue";
import Register from "@/components/register/register.vue";
import RegisterSuccess from "@/components/register/register_success.vue";
import Authorize from "@/components/authorize/authorize.vue";
import PasswordReset from "@/components/password_reset/password_reset.vue";

Vue.use(VueRouter);

const routes = [
    { path: '/', redirect: 'login' },
    { path: '/login', name: 'login', component: Login },
    { path: '/register', name: 'register', component: Register },
    { path: '/register_success', name: 'register_success', component: RegisterSuccess },
    { path: '/authorize', name: 'authorize', component: Authorize },
    { path: '/password_reset', name: 'password_reset', component: PasswordReset },
]

export default new VueRouter({
    // mode: 'history',
    routes // (缩写) 相当于 routes: routes
})

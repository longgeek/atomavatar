import Vue from 'vue'
import App from './App.vue'
import router from '@/router'
import store from './store'
import Vuelidate from 'vuelidate'
import "@/scss/index.scss";
import API from '@/api.url.js'

Vue.config.productionTip = false
Vue.use(Vuelidate)

// 全局 API URL
Vue.prototype.__API__ = API

//
// 全局 Sleep 函数
// this.__SLEEP__().then(() => {
//     console.log('this is sleep demo.');
// })
Vue.prototype.__SLEEP__ = function(time) {
    return new Promise(resolve => setTimeout(resolve, time))
}

let userData = localStorage.getItem('userInfo');
if (userData){
    userData = JSON.parse(userData);
    store.commit("setUserSession", userData);
}

const bus = new Vue({
    store,
    router,
    render: h => h(App)
}).$mount('#app')

export default { bus }

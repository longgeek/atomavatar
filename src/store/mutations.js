export default {
    setToken(state, token){
        state.loginToken = token
    },
    setUserSession(state, data) {
        if(data){
            state.user = Object.assign(state.user, data)
        }else{
            state.user = {
                loginName:"",
                nickname:"",
                headImgUrl:"",
                roleTypes:"",
            }
        }
    },
    setNeedLogin(state, data){
        state.needLogin = data
    }
}
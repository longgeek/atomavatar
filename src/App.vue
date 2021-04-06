<template>
  <div>
    <div>
    <router-view> </router-view>
    </div>
  </div>
</template>

<script>
// import HelloWorld from './components/HelloWorld';
// import MainPanel from './components/MainPanel';
// import logo from './assets/logo.svg'
// import Footer from "@/components/Footer.vue"

export default {
  name: "App",

  components: {
  },

  data: () => {
    return {

    }
  },
  computed:{
  },
  methods: {
    onEvent(event){
      event;
    //   switch(event.name){
    //     case 'showBlogEditor':{
    //     }break;
    //     case 'showImgUpload':{
    //     }
    //   }
    }
  },
  mounted() {
  },
  watch: {
    // "$store.state.needLogin": function () {
    //   if (this.$store.state.needLogin) {
    //     this.$refs.loginPanel.showModal();
    //     this.$store.commit("setNeedLogin", false);
    //   }
    // },
  },
};
</script>

<style>
a {
  background: none;
  display: inline-block;
  text-decoration: none;
}

a :hover{
  color: #1890ff;
}
</style>

/**
 *  忘记密码组件
 *  分三个步骤：身份验证、重置密码、重置完成
 */

import api from "@/api.config";
import uuidv1 from "uuid/dist/v1";
import { required, minLength, maxLength } from "vuelidate/lib/validators";

import { FormWizard, TabContent, WizardButton } from "vue-form-wizard";


const data = function() {
    return {
        // 身份验证步骤表单
        step1: {
            name: '',                       // 手机号或邮箱
            captcha: '',                    // 图片验证码
            msgCode: '',                    // 短信或邮箱验证码
            submitted: false,               // 代表表单被提交
        },
        // 重置密码表单
        step2: {
            password: '',                   // 用户密码
            repeatPassword: '',             // 重复密码
            submitted: false,               // 代表表单被提交
        },
        step3: {
            submitted: false,               // 代表表单被提交
        },
        loading: false,                     // 控制提交按钮禁用
        errorMsg: '',                       // 当表单有误时前端提醒文字

        // 图片验证码相关
        captcha: '',                        // 图片验证码 <img> 的 :src 值
        captchaToken: '',
        captchaLoading: false,              // 用于点击更换图片验证码

        // 短信、邮箱验证码相关
        msgCodeDisplay: true,               // 用于控制获取验证码按钮切换
        msgCodeTime: 60,                    // 用于设定短信验证码 CD 时长
        msgCodeTimer: 60,                   // 用于短信验证码计时
    }
};

const methods = {
    /*
     *  对手机号和邮箱判断
     */
    isPhone(v) { return /^[1][3,4,5,6,7,8][0-9]{9}$/.test(v) },
    isEmail(v) { return /.+@.+\..+/.test(v) },
    /*
     *  身份验证表单 - 用于验证输入格式是否有效
     */
    submitStep1(props) {
        if (this.loading) return;

        this.loading = true;
        this.step1.submitted = true;

        // 判断手机号或邮箱是否符合规范
        if (!this.isPhone(this.step1.name) && !this.isEmail(this.step1.name)) {
            this.errorMsg = '输入的手机号或邮箱格式有误，请重新输入';
            this.loading = false;
            return;
        }

        // 判断表单是否无效
        if (this.$v.step1.$invalid) {
            // 根据表单错误项输出提示内容
            if (this.$v.step1.name.$error) { this.errorMsg = '请输入手机号或邮箱' }
            else if (this.$v.step1.captcha.$error) { this.errorMsg = '请输入 4 位图片验证码' }
            else if (this.$v.step1.msgCode.$error) { this.errorMsg = '请输入 6 位短信或邮箱验证码' }
            this.$v.$touch();
            this.loading = false;
            return;
        }

        // 输入格式验证成功
        this.loading = false;
        this.errorMsg = false;

        // 切换到 step2 重置密码表单
        props.nextTab();
    },
    /*
     *  重置密码表单
     */
    submitStep2(props) {
        if (this.loading) return;

        this.loading = true;
        this.step2.submitted = true;

        // 判断表单是否无效
        if (this.$v.step2.$invalid) {
            // 根据表单错误项输出提示内容
            if (this.$v.step2.password.$error) { this.errorMsg = '请输入新的密码' }
            else if (this.$v.step2.repeatPassword.$error) { this.errorMsg = '请再次输入新的密码' }
            this.$v.$touch();
            this.loading = false;
            return;
        }

        // 判断两次输入的密码是否一致
        if (this.step2.password !== this.step2.repeatPassword) {
            this.errorMsg = '两次输入的密码不一致，请重新输入';
            this.loading = false;
            return;
        }

        // 判断密码复杂性是否符合要求
        const pwdRegex = new RegExp('(?=.*[0-9])(?=.*[a-zA-Z]).{6,20}');
        if (!pwdRegex.test(this.step2.password)) {
            this.errorMsg = '密码不符合要求，要求由 6-20 个英文字母和数字组合';
            this.loading = false;
            return;
        }

        // 输入格式验证成功
        this.loading = false;
        this.errorMsg = false;


        // 调用重置密码 API
        this.submitAPI(props);
    },
    /*
     *  提交重置密码请求
     */
    submitAPI(props) {
        // 生成 POST API 参数
        const params = {
            captchaToken: this.captchaToken,
            verifyCode: this.step1.msgCode,
            password: this.step2.password,
            confirmPassword: this.step2.repeatPassword,
        };

        // 判断输入的手机或邮箱
        if (this.step1.name.indexOf('@') !== -1) {
            params.email = this.step1.name;
        } else if (this.step1.name.length === 11 && /^1[3456789]\d{9}$/.test(this.step1.name)) {
            params.phone = this.step1.name;
        }

        // 调用身份验证 API，验证成功后进入重置密码步骤
        api.postJsonApi(this.__API__.login.changePassword(), params)
            .then((response) => {
                if (response.data.code !== 200) {
                    this.$bvToast.toast(response.data.msg, {
                        title: '重置失败', variant: 'danger', toaster: 'b-toaster-bottom-right'
                    });
                    this.loading = false;
                    return;
                }
                this.loading = false;

                // 切换到 step3 重置完成
                props.nextTab();
            }).catch((error) => {
                this.$bvToast.toast(error, {
                    title: '密码重置错误', variant: 'danger', toaster: 'b-toaster-bottom-right'
                });
                this.loading = false;
            })
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
    /*
     *  获取手机号或邮箱验证码方法
     */
    getMsgCode() {
        // 检查: 发送手机、邮箱验证码前三步检查
        // 1.1 判断手机号或邮箱是否已输入
        if (!this.step1.name || !this.step1.captcha) {
            this.$bvToast.toast(
                '请输入手机号或邮箱以及图片中验证码后，再点击发送验证码',
                {title: '提示', variant: 'danger', toaster: 'b-toaster-bottom-right'}
            );
            return;
        }

        // 1.2 判断手机号或邮箱是否符合规范
        if (!this.isPhone(this.step1.name) && !this.isEmail(this.step1.name)) {
            this.$bvToast.toast(
                '输入的手机号或邮箱格式有误，请重新输入',
                {title: '提示', variant: 'danger', toaster: 'b-toaster-bottom-right'}
            );
            return;
        }

        // 1.3 判断图片验证码是否为 4 位
        if (this.step1.captcha.length !== 4) {
            this.$bvToast.toast(
                '输入的图片验证码格式有误，请检查',
                {title: '提示', variant: 'danger', toaster: 'b-toaster-bottom-right'}
            );
            return;
        }
        // 检查 End

        // 2. 根据用户输入的信息，判断出手机号或邮箱，生成发送验证码 API 数据结构
        let apiURL = '';
        const params = { captchaToken: this.token, imageCode: this.step1.captcha };

        if (this.step1.name.indexOf('@') !== -1) {
            apiURL = this.__API__.register.getEmailCode();
            params.checkCodeType = 5;   // 0:手机号注册,1:手机号绑定,2:手机号密码重置,3:邮箱注册,4:邮箱绑定,5:邮箱密码重置
            params.email = this.step1.name;
        } else if (this.step1.name.length === 11 && /^1[3456789]\d{9}$/.test(this.step1.name)) {
            apiURL = this.__API__.register.getPhoneCode();
            params.checkCodeType = 2;   // 0:手机号注册,1:手机号绑定,2:手机号密码重置,3:邮箱注册,4:邮箱绑定,5:邮箱密码重置
            params.phone = this.step1.name;
        }

        // 3. 调用 API 发送验证码
        api.postJsonApi(apiURL, params)
            .then((response) => {
                if (response.data.code !== 200) {
                    // 修改图片验证码的 Token 让其失效
                    this.captchaToken = uuidv1();
                    return;
                }

                this.msgCodeDisplay = false;

                const timer = setInterval(() => {
                    this.msgCodeTimer--;
                    if (this.msgCodeTimer === 0) {
                        this.msgCodeTimer = this.msgCodeTime;
                        this.msgCodeDisplay = true;
                        timer && clearInterval(timer);
                    }
                }, 1000)

                this.$once('hook:beforeDestroy', function() {
                    timer && clearInterval(timer);
                })
            }).catch((error) => {
                this.$bvToast.toast(error, {
                    title: '验证码发送失败', variant: 'danger', toaster: 'b-toaster-bottom-right'
                });
                this.loading = false;
            });
    },
    // 点击下一步触发的事件
    nextEvent(props) {
        if (props.activeTabIndex == 0) this.submitStep1(props);
        if (props.activeTabIndex == 1) this.submitStep2(props);
        if (props.activeTabIndex == 2) this.$router.push({name: 'login', query: this.$route.query});
    }
};

export default {
    data,
    methods,
    created() {
        this.getCaptcha();
    },
    mounted() {
        this.$nextTick(() => { this.$refs.autofocus.focus() });
    },
    components: { FormWizard, TabContent, WizardButton },
    // form 表单验证
    validations: {
        step1: {
            name: { required },
            captcha: { required, minLength: minLength(4), maxLength: maxLength(4) },
            msgCode: { required, minLength: minLength(6), maxLength: maxLength(6) },
        },
        step2: {
            password: { required, minLength: minLength(6), maxLength: maxLength(20) },
            repeatPassword: { required, minLength: minLength(6), maxLength: maxLength(20) },
        },
    },
};

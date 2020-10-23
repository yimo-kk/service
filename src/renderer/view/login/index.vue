<template>
<div class="login">
    <div v-if="loading" class="spin">
        <a-spin class="loading"></a-spin>
    </div>
    <a-card style="width: 400px;textAlign: center;paddingTop:20px">
        <a-form :form="loginParam" :label-col="{ span: 5 }" :wrapper-col="{ span: 17 }" @submit="handleSubmit">
            <a-form-item label="商家标识" >
                <a-input placeholder="请输入商家标识" v-decorator="['shopCode', { initialValue: loginData.shopCode },{ rules: [  
                { required: true, message: '请填写商家标识!' },{
                validator: validateShopCode,
              }
              ] 
              }]" allowClear autoComplete="on">
                    <a-icon slot="prefix" type="shop" />
                </a-input>
            </a-form-item>
            <a-form-item label="账号">
                <a-input placeholder="请输入账号" v-decorator="['account',{ initialValue: loginData.account }, { rules: [{ required: true, message: '请填写客服账号!' }] }]" allowClear autoComplete="on">
                    <a-icon slot="prefix" type="user" />
                </a-input>
            </a-form-item>
            <a-form-item label="密码">
                <a-input-password placeholder="请输入密码" v-decorator="['password',{ initialValue: loginData.password }, { rules: [{ required: true, message: '请填写密码!' }] }]" allowClear>
                    <a-icon slot="prefix" type="lock" />
                </a-input-password>
            </a-form-item>
            <a-form-item :wrapper-col="{ span: 17, offset: 4 }">
                <a-button type="primary" html-type="submit" style="width:100%">登录</a-button>
                <a-checkbox
                    v-decorator="[
                    'remember',
                    {
                        valuePropName: 'checked',
                        initialValue: true,
                    },
                    ]"
                >
                    <p class="remember_password">记住账号/密码</p>
                </a-checkbox>
              
                <!-- <a-button type="primary" @click="winSize">修改窗口大小</a-button> -->
            </a-form-item>
        </a-form>
    </a-card>
</div>
</template>

<script>
const session = require('electron').remote.session;
import { mapActions } from "vuex";
export default {
    name: "Login",
    components: {},
    data() {
        return {
            ip:'',
            loading: false,
            loginParam: this.$form.createForm(this, {
                name: "login",
            }),
            loginData:{
                shopCode:'',
                account:'',
                password:''
            },
             url: window.location.protocol+"//"+window.location.host
        };
    },
    computed: {},
    watch: {},
    methods: {
        ...mapActions(["handleLogin", "getUserInfo"]),
        handleSubmit(e) {
            e.preventDefault();
            this.loginParam.validateFields((err, values) => {
                if (!err) {
                    let params = {
                      username: values.account,
                      password: values.password,
                      seller_code: values.shopCode,
                };
                 
                if(values.remember){
                      this.setCookie('seller_code',params.seller_code)
                      this.setCookie('username',params.username)
                      this.setCookie('password',params.password)
                    }else {
                  this.clearCookies()
                }
                this.loading = true;
                params.login_ip=this.ip
                this.handleLogin(params).then((result) => {
                        if (result.code === 0) {
                            localStorage.setItem("accessToken", result.data.accessToken);
                            localStorage.setItem("refreshToken", result.data.refreshToken);
                            this.$message.success(result.msg);
                            this.getUserInfo().then((res) => {
                                this.loading = false;
                                res.code === 0 &&
                                    this.$router.push({
                                        name: "Home",
                                    }); 
                            });
                        } else {
                            this.$toast({
                                content: result.msg,
                            });
                        }
                    }).catch(error=>{
                    this.loading = false;
                })
                }
            });
        },
        // 校验商家标识
        validateShopCode(rule, value, callback) {
            var reg=/[^\w\.\/]/;
            if(value && reg.test(value)){
                callback('请输入正确的商家标识码！');
            } else {
                callback();
            }
        },
        // 存储账号等
        setCookie(name,value){
            let Days = 300;
            let exp = new Date();
            let date = Math.round(exp.getTime() / 1000) + Days * 24 * 60 * 60;
             const cookie = {
              url:this.url,
              name: name,
              value: value,
              expirationDate: date
            };
            session.defaultSession.cookies.set(cookie, (error) => {
              if (error) console.error(error);
            });
        },
        /**
         * 获得
         */
        getCookies() {
          session.defaultSession.cookies.get({ url: this.url },  (error, cookies)=> {
            console.log(cookies,9999);
            if (cookies.length > 0) {
              this.$nextTick(()=>{
                  this.loginData = {
                  account:cookies[1].name == 'username' ? cookies[1].value:'', 
                  password:cookies[2].name  == 'password' ? cookies[2].value:'',
                  shopCode:cookies[0].name  == 'seller_code' ? cookies[0].value:''
                }
              })
            }
          });
        },
        /**
         * 清空缓存
         */
        clearCookies () {
          session.defaultSession.clearStorageData({
            origin: this.url,
            storages: ['cookies']
          }, function (error) {
            console.log(error)
            if (error) console.error(error);
          })
        },
        },
    created() {
    }, 
    mounted() {
        this.ip = returnCitySN["cip"]; // ip
        this.$store.commit('SET_USER_IP',{ip:this.ip})
        this.getCookies()
    },
};
</script>

<style lang="less" scoped>
.login {
    width: 100%;
    height: 100vh;
    background: url("https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=3296579017,1843088940&fm=26&gp=0.jpg") no-repeat;
    background-size: cover;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
}

.spin {
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.4);
    position: absolute;
    left: 0;
    top: 0;
    z-index: 333;

    .loading {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 555;
    }
}
.remember_password{
    font-size: 10px;
    color: #ccc;
}

/deep/.ant-input {
    font-size: 12px;
    border: 1px solid #d9d9d9;
}

/deep/.ant-form-item-control {
    text-align: left;
}

/deep/.ant-form-explain {
    font-size: 12px;
}
/deep/ .ant-checkbox-wrapper{
        display: flex;
    align-items: center;
}
</style>

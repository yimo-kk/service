<template>
<div class="login">
    <div v-if="loading" class="spin">
        <a-spin class="loading"></a-spin>
    </div>
    <a-card style="width: 400px;textAlign: center;paddingTop:20px">
        <a-form :form="loginParam" :label-col="{ span: 6 }" :wrapper-col="{ span: 17 }" @submit="handleSubmit">
            <a-form-item :label="$t('login.shopCode')" >
                <a-input  :placeholder="$t('login.pleaseShopCode')" v-decorator="['shopCode', { initialValue: loginData.shopCode },{ rules: [  
                { required: true, message: $t('login.pleaseShopCode') },{
                validator: validateShopCode,
              }
              ] 
              }]" allowClear>
                    <a-icon slot="prefix" type="shop" />
                </a-input>  
            </a-form-item>
            <a-form-item :label="$t('login.account')">
                <a-input  :placeholder="$t('login.pleaseAccount')" v-decorator="['account',{ initialValue: loginData.account },
                 { rules: [{ required: true, message: $t('login.pleaseAccount') }] }]" allowClear >
                    <a-icon slot="prefix" type="user" />
                </a-input>
            </a-form-item>
            <a-form-item :label="$t('login.password')">
                <a-input-password  :placeholder="$t('login.pleasePassword')" v-decorator="['password',{ initialValue: loginData.password },
                 { rules: [{ required: true, message: $t('login.pleasePassword') }] }]" allowClear>
                    <a-icon slot="prefix" type="lock" />
                </a-input-password>
            </a-form-item>
            <a-form-item :wrapper-col="{ span: 17, offset: 4 }">
                <a-button type="primary" html-type="submit" style="width:100%"> {{$t('login.logIn')}}</a-button>
                <a-checkbox
                    v-decorator="[
                    'remember',
                    {
                        valuePropName: 'checked',
                        initialValue: true,
                    },
                    ]"
                >
                    <p class="remember_password">{{$t('login.remember')}}</p>
                </a-checkbox>
                <!-- <a-button type="primary" @click="winSize">修改窗口大小</a-button> -->
            </a-form-item>
        </a-form>
    </a-card>
</div>
</template>

<script>
const session = require('electron').remote.session;
import { mapActions,mapMutations } from "vuex";
import {isLocalStorage} from '@/utils/libs'
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
             url: window.location.href.split('#')[0]
        };
    },
    computed: {},
    watch: {},
    methods: {
        ...mapActions(["handleLogin", "getUserInfo"]),
        ...mapMutations(["SET_USER_INFO"]),
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
                            window.shopCode =params.seller_code
                            // localStorage.setItem("accessToken", result.data.accessToken);
                            // localStorage.setItem("refreshToken", result.data.refreshToken);
                            this.$message.success(result.msg);
                            this.getUserInfo({
                               accessToken: result.data.accessToken,
                               refreshToken: result.data.refreshToken
                            }).then((res) => { 
                                // this.SET_USER_INFO(res.data)
                                 window.kefu_code = res.data.kefu_code
                                  let kefu_info = res.data
                                   kefu_info['accessToken']=result.data.accessToken
                                    kefu_info['refreshToken']=result.data.refreshToken
                               if( isLocalStorage(params.seller_code)){
                                   let code = JSON.parse( localStorage.getItem(params.seller_code))
                                    code[res.data.kefu_code] = kefu_info
                                    localStorage.setItem(params.seller_code,JSON.stringify(code))
                               }else {
                                   let obj={}
                                   obj[res.data.kefu_code]=kefu_info
                                   localStorage.setItem(params.seller_code,JSON.stringify(obj))
                               }
                                this.loading = false;
                                res.code === 1 &&
                                    this.$router.push({
                                        name: "Home",
                                        query:{
                                            seller_code:params.seller_code,
                                            kefu_code:res.data.kefu_code
                                        }
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
            localStorage.setItem(name,value)
            // let exp = new Date();
            // this.$cookie.set(name, value,Math.round(exp.getTime() / 1000) + 3000 * 24 * 60 * 60);

            // alert(window.location.href)
            // alert(this.url)
            // let Days = 300;
            // let exp = new Date();
            // let date = Math.round(exp.getTime() / 1000) + Days * 24 * 60 * 60;
            //  const cookie = {
            //   url:this.url,
            //   name: name,
            //   value: value,
            //   expirationDate: date
            // };
            // session.defaultSession.cookies.set(cookie, (error) => {
            //   if (error) console.error(error);
            // });
        },
        /**
         * 获得
         */
        getCookies() {
               this.loginData = {
                  account:localStorage.getItem("username"), 
                  password:localStorage.getItem("password"), 
                  shopCode:localStorage.getItem("seller_code"), 
                }
                // this.loginData = {
                //   account:this.$cookie.get("username"), 
                //   password:this.$cookie.get("password"), 
                //   shopCode:this.$cookie.get("seller_code"), 
                // }
        //   session.defaultSession.cookies.get({ url: this.url },  (error, cookies)=> {
        //       alert(cookies)
        //     if (cookies.length > 0) {
        //       this.$nextTick(()=>{
                //   this.loginData = {
                //   account:cookies[1].name == 'username' ? cookies[1].value:'', 
                //   password:cookies[2].name  == 'password' ? cookies[2].value:'',
                //   shopCode:cookies[0].name  == 'seller_code' ? cookies[0].value:''
                // }
        //       })
        //     }
        //   });
        },
        /**
         * 清空缓存
         */
        clearCookies () {
             
            localStorage.removeItem("username")
            localStorage.removeItem("password")
            localStorage.removeItem("seller_code")

            // this.$cookie.delete("username")
            // this.$cookie.delete("password")
            // this.$cookie.delete("seller_code")
        //   session.defaultSession.clearStorageData({
        //     origin: this.url,
        //     storages: ['cookies']
        //   }, function (error) {
        //     if (error) console.error(error);
        //   })
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

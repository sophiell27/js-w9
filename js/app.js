console.clear();


let productData = []

const productList = document.querySelector(".productWrap")
const cartList = document.querySelector(".cartList")
// console.log(productList)

function init(){
    getProductData()
    getCartData()
}
init()


// product list logic 
function getProductData(){
    let url = `${baseUrl}/api/livejs/v1/customer/${api_path}/products`
    axios.get(url)
    .then(res => {
        productData = res.data.products
        renderProductList(productData)
        getSelectOptions()
    })
    .catch(error =>{
        console.log(error)
    })
}

function renderProductList(data){
    let str ="";
    data.forEach(item => {
        str += ` <li class="productCard">
        <h4 class="productType">新品</h4>
        <img src="${item.images}" alt="">
        <a href="#" class="addCardBtn" data-id="${item.id}" >加入購物車</a>
        <h3>${item.title}</h3>
        <del class="originPrice">NT$${toThousands(item.origin_price)}</del>
        <p class="nowPrice">NT$${toThousands(item.price)}</p>
    </li>`
    })
    productList.innerHTML = str
}

// cart list logic 
let cartData = []


function getCartData(){
    
    let url = `${baseUrl}/api/livejs/v1/customer/${api_path}/carts`
    axios.get(url)
    .then(res => {
        cartData= res.data.carts
        // console.log(res.data)
        renderCart(cartData)
        document.querySelector(".totalAmount").textContent =  `NT$${toThousands(res.data.finalTotal)}`
    })
    .catch(error =>{
        console.log(error)
    })
}


function renderCart(data){
    if (data.length === 0){
        cartList.innerHTML = `<p style="text-align:center; color:red">購物車沒有內容</p>`
        return
    }
    let str = ""
    data.forEach(item => {
        str += `<tr><td>
        <div class="cardItem-title">
            <img src="${item.product.images}" alt="">
            <p>${item.product.title}</p>
        </div>
    </td>
    <td>NT$${toThousands(item.product.price)}</td>
    <td>${item.quantity}</td>
    <td>NT$${toThousands(item.product.price *item.quantity)}</td>
    <td class="discardBtn">
        <a href="#" class="material-icons discardBtn" data-id=${item.id}>
            clear
        </a>
    </td></tr> `
    })
    
    cartList.innerHTML = str 
}

// add item to cart 
productList.addEventListener("click", (e) => {
    if (e.target.getAttribute("class") !== "addCardBtn"){
        return
    }
    e.preventDefault();
    let productId = e.target.dataset.id
    let num = 1
    let cartId;
    cartData.forEach(item => {
        if (item.product.id == productId){
            num += item.quantity
            cartId = item.id
        
        }
    })
    if (num == 1){
        addItem(productId,num)
       
    }else {
        patchcartItem(cartId, num)
        
    }
    
})

function addItem(id,quantity){
    let url = `${baseUrl}/api/livejs/v1/customer/${api_path}/carts`
    axios.post(url, {
        "data": {
          "productId": id,
          "quantity": quantity
        }
      })
      .then(res => {
        getCartData()
      })
      .catch(error =>{
        console.log(error)
    })
}

function patchcartItem(id,quantity){
    let url = `${baseUrl}/api/livejs/v1/customer/${api_path}/carts`
    axios.patch(url, {
        "data": {
          "id": id,
          "quantity": quantity
        }
      })
      .then(res => {
        getCartData()
      })
      .catch(error =>{
        console.log(error)
    })
}




// delete cart item 

cartList.addEventListener("click", (e) => {
    if (e.target.classList.contains("discardBtn") === false){
        return
    }
    e.preventDefault();
    let id = e.target.dataset.id
    deleteItem(id)
})

function deleteItem(id){
    let url = `${baseUrl}/api/livejs/v1/customer/${api_path}/carts/${id}`
    axios.delete(url)
    .then(res => {
        getCartData()
    })
    .catch(error =>{
        console.log(error)
    })
}

const discardAllBtn = document.querySelector(".discardAllBtn")


discardAllBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (cartData.length === 0){
        alert("購物車內並沒有物品")
        return
    }
    deleteAll()
    setTimeout(()=>{
        alert("購物車已清空！")
    },1000)
})

function deleteAll(){
    let url = `${baseUrl}/api/livejs/v1/customer/${api_path}/carts`
    axios.delete(url)
    .then(res => {
        getCartData()
    })
    .catch(error =>{
        console.log(error)
    })
}

// select  

const productSelect = document.querySelector(".productSelect")
// console.log(productSelect)

function getSelectOptions(){
    let unsorted = productData.map(item => {
        return item.category
    })
    let sorted = unsorted.filter((item,index) => {
        if (unsorted.indexOf(item) === index){
            return item
        }
    })
    renderSelectOptions(sorted)
}

function renderSelectOptions(sorted){
    let str = ` <option value="全部" selected>全部</option>`
    sorted.forEach(item => {
        str += `<option value="${item}">${item}</option>`
    })
    productSelect.innerHTML = str
}

productSelect.addEventListener("change", (e) => {
    let value = e.target.value
    if (value === "全部"){
        renderProductList(productData)
    }else {
        let selectedData = productData.filter(item => {
            if (item.category === value){
                return item
            }
        })
        renderProductList(selectedData)
    }
})


// submit order 

const orderInfoForm = document.querySelector(".orderInfo-form")
const inputs = document.querySelectorAll("input[name],select")
// console.log(inputs);

orderInfoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    console.log("aa");
    if (cartData.length === 0){
        alert("你的購物車為空，無法送出訂單！")
        return
    }
    const constraints = {
        "姓名":{
            presence: {
                message: `必須填寫`
            } 
        },
        "電話":{
            presence:{
                message: `必須填寫`
            },
            length: {
                minimum: 8,
                message: "須為8位數"
            }

        },
        "Email":{
            presence:{
                message: `必須填寫`
            },
            format: {
                pattern: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
                message: "不正確"
            }

        },
        "寄送地址": {
            presence:{
                message: `必須填寫`
            }
        },
        "交易方式": {
            presence:{
                message: `必須填寫`
            }
        }
        
    }

    inputs.forEach(item => {
        item.nextElementSibling.textContent = "";
        let errors = validate(orderInfoForm, constraints) || "";
        console.log(errors)

        if (errors){
            Object.keys(errors).forEach(key => {
               document.querySelector(`[data-message=${key}]`).textContent = errors[key]
            })
        }
       
    })
    const name = document.querySelector("#customerName").value
    const tel = document.querySelector("#customerPhone").value
    const email = document.querySelector("#customerEmail").value
    const address = document.querySelector("#customerAddress").value
    const payment = document.querySelector("#tradeWay").value

    let url = `${baseUrl}/api/livejs/v1/customer/${api_path}/orders`
    axios.post(url,{
        "data": {
          "user": {
            "name": name,
            "tel": tel,
            "email": email,
            "address": address,
            "payment": payment
          }
        }
      })
      .then(res => {
        setTimeout(()=> {
            alert("訂單成功送出！")
        },1000);
        orderInfoForm.reset();
        getCartData();
        
      })
      .catch(error => {
        console.log(error.message)
      })

})




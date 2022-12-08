console.clear();




const adminOrderList = document.querySelector(".adminOrderList")
let ordersData = []




function getOrders(){
    let url = `${baseUrl}/api/livejs/v1/admin/${api_path}/orders`
    axios.get(url,{
        headers:{
            "authorization":token
        }
    })
    .then(res => {
        ordersData = res.data.orders
        console.log(ordersData)
        renderOrderList();
        renderOrderChart();
        renderChart2();
    })
    .catch(error => {
        console.log(error)
    })
}

function init(){
  getOrders()

}

init();

function renderOrderChart(){
  const ordersProducts = ordersData.map(item => {
    return item.products
  }) 
   const  newObj = ordersProducts.reduce((obj,item) => {
    item.forEach(product => {
      if (product.category in obj){
        obj[product.category] += product.price*product.quantity
      }else {
        obj[product.category] = product.price*product.quantity
      }
    })
      return obj
   },{})
  //  console.log(newObj);

   const chartCatData = Object.entries(newObj).sort((a,b) => {
    a[1]-b[1]
   }) // lv1 

   const colorGroup = ["#5434A7", "#9D7FEA", "#DACBFF", "#bebebe"]
   const CatColorData = Object.keys(newObj).reduce((accu, item, index) => {
    return {...accu, [item]:colorGroup[index]}
   },{})  // lv1

  //  console.log(CatColorData);

  var chart = c3.generate({
    bindto: '#chart',
    data: {
      columns: chartCatData,
      type: "pie",
      colors: CatColorData
    }
  });


  }

  
function renderChart2(){
  const ordersProducts = ordersData.map(item => {
  return item.products
}) 
  const  newTitleObj = ordersProducts.reduce((obj,item) => {
    item.forEach(product => {
      console.log(product)
      if (product.title in obj){
        obj[product.title] += product.price*product.quantity
      }else {
        obj[product.title] = product.price*product.quantity
      }
    })
      return obj
    },{})

    console.log(newTitleObj);

    const titleChartData = Object.entries(newTitleObj)
    titleChartData.sort(([a,b], [c,d]) => {
    return d-b
    })
    const newtitleData=[]
      let other = ["其他", 0]
      titleChartData.forEach((item,index) => {
        if (index <= 2){
          newtitleData.push(item)
        }else {
          other[1] += item[1]
        }
      })
      if (titleChartData.length >3){
        newtitleData.push(other)
      }

    
    console.log(newtitleData)

    
    // console.log(newtitleData)

    var chart2 = c3.generate({
      bindto: '#chart2',
      data: {
        columns: newtitleData,
        type: "pie",
        order: null
        // colors: pieColor
      }
    });

}


function renderOrderList(){
    let str = ""
    ordersData.forEach(item => {
        let productStr = ""
        let timeStamp = new Intl.DateTimeFormat("zh-TW").format(item.createdAt *1000)
        let orderPaymentStatus;

        if (item.paid === false){
          orderPaymentStatus = "未處理"
        }else {
          orderPaymentStatus = "已處理"
        }

        item.products.forEach(item => {
            productStr += `<p>${item.title}
            </p>`
        })
        // console.log(item.products)
        str += `<tr>
        <td>${item.id}</td>
        <td>
          <p>${item.user.name}</p>
          <p>${item.user.tel}</p>
        </td>
        <td>${item.user.address}</td>
        <td>${item.user.email}</td>
        <td>
          ${productStr}
        </td>
        <td>${timeStamp}</td>
        <td class="orderStatus">
          <a href="#" class="orderStatus" data-id=${item.id}>${orderPaymentStatus}</a>
        </td>
        <td>
          <input type="button" class="delSingleOrder-Btn" value="刪除" data-id=${item.id}>
        </td>
        </tr>`
    })
    adminOrderList.innerHTML = str
}

// click to change order payment status /delete order

adminOrderList.addEventListener("click", (e) => {
  // change order payment status 
  let orderId = e.target.getAttribute("data-id")
  if (e.target.classList.contains("orderStatus")){
    e.preventDefault();
    let status;
    if (e.target.textContent === "未處理"){
      e.target.textContent = "已處理"
      status = true
    }else {
      e.target.textContent = "未處理"
      status = false
    }
    adminPutOrderStaus(orderId,status)
  }

  // delete order 
  if (e.target.classList.contains("delSingleOrder-Btn")){
    adminDeleteOrder(orderId)
    setTimeout(()=> {
      alert("你已刪除了一筆訂單")
    },1000)
  }

})

// change order payment status  -> api 

function adminPutOrderStaus(id,status){
  let url = `${baseUrl}/api/livejs/v1/admin/${api_path}/orders`
  axios.put(url,{
    "data": {
      "id": id,
      "paid": status
    }
  },
  {
    headers:{
        "authorization":token
    }
})
  .then(res => {
    console.log(res.data);
  })
  .catch(error => {
    console.log(error);
  })

}


function adminDeleteOrder(id){
  let url = `${baseUrl}/api/livejs/v1/admin/${api_path}/orders/${id}`
  axios.delete(url,{
    headers:{
        "authorization":token
    }
})
.then(res => {
  getOrders()
})
.catch(error => {
  console.log(error.message);
})
}

const discardAllBtn = document.querySelector(".discardAllBtn")

discardAllBtn.addEventListener("click", (e) => {
  e.preventDefault();
  adminDeleteAllOrder()
})

function adminDeleteAllOrder(){
  let url = `${baseUrl}/api/livejs/v1/admin/${api_path}/orders`
  axios.delete(url,{
    headers:{
        "authorization":token
    }
}
    )
  .then(res => {
    setTimeout(()=> {
      alert("所有訂單已刪除！")
    }, 1000)
    getOrders()
  })
  .catch(error => {
    console.log(error);
  })
}

let currentPage = 1;
const API = `http://localhost:8050/contactbook?_page=${currentPage}&_limit=3`;
const secondApi = 'http://localhost:8050/contactbook';
let productName = $('#product-name')
let productPrice = $('#product-price')
let productLastName = $('#product-last')
let btnSave = $('.btn-save')
let modal = $('.modal')

// ! CREATE
async function addProduct() {
    let name = productName.val();
    let price = productPrice.val();
    let lastName = productLastName.val();
    let product = {
        name, 
        price,
        lastName,
    };
    try{
        const response = await axios.post(API, product);
        console.log(response);
        Toastify({
          text: response.statusText,
          duration: 3000,
          newWindow: true,
          close: true,
          gravity: "top", // `top` or `bottom`
          position: "left", // `left`, `center` or `right`
          stopOnFocus: true, // Prevents dismissing of toast on hover
          style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)",
          },
        }).showToast();
          modal.modal("hide");
    } catch(e){
        console.log(e);
        Toastify({
            text: e.response.statusText,
            duration: 3000,
            newWindow: true,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "center", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
              background: "purple",
            },
          }).showToast();
    }
}

btnSave.on('click', addProduct);

// ! READ
let list = $('.list');
let prev = $('.prev');
let next = $('.next');


async function render(url) {
    try{
        const response = await axios(url);
        console.log(response.headers.link);
        list.html("")
        response.data.forEach(item => {
            list.append(`
            <div class="card mt-3 mb-3" style="width: 20rem;">
                <img style="width: 100%; object-fit: contain; height: 200px;" src="https://www.pinclipart.com/picdir/big/537-5375838_google-messages-logo-clipart.png" class="card-img-top" alt="...">
                <div class="card-body">
                <h5 class="card-title">${item.name}</h5>
                <p class="card-text">${item.lastName}</p>
                <a href="#">${item.price}</a>
                <button id=${item.id} type="button" class="btn btn-primary edit-btn" data-bs-toggle="modal" data-bs-target="#editModal">
                    Изменить
                </button>
                <button id=${item.id} type="button" class="btn btn-danger delete-btn">
                    Удалить
                </button>
            </div>
        </div>
            `);
        });
        // ! PAGINATION
        let links = response.headers.link.match(/(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/gim)
        if(!links){
            prev.attr('disabled', 'true');
            next.attr('disabled', 'true');
        } 
        if(links.length === 4) {
            prev.attr('id', links[1]);
            next.attr('id', links[2]);
            prev.removeAttr('disabled');
            next.removeAttr('disabled');
        } else if(links.length === 3 && currentPage === 1){
            prev.attr('disabled', 'true');
            next.attr('id', links[1]);
        } else if(links.length === 3 && currentPage !== 1){
            next.attr('disabled', 'true');
            prev.attr('id', links[1]);
        }
    } catch(e) {
        console.log(e);
    }
}

render(API);

next.on('click', (e) => {
    let url = e.target.id ;
    render(url);
    currentPage++
})

prev.on('click', (e) => {
    let url = e.target.id;
    render(url);
    currentPage--
})



// ! SEARCH
let searchInp = $('.inp-search');
searchInp.on('input', (e) => {
    let value = e.target.value
    let url = `${API}&q=${value}`
    render(url);
})


// ! UPDATE
let productNameEdit = $('#product-name-edit');
let productPriceEdit = $('#product-price-edit');
let productDescEdit = $('#product-desc-edit');
let productImageEdit = $('#product-last-edit');
let btnSaveEdit = $('.btn-save-edit');


$(document).on('click', ".edit-btn", async (e) => {
    let id = e.target.id
    try {
        const response = await axios(`${secondApi}/${id}`);
        productNameEdit.val(response.data.name);
        productImageEdit.val(response.data.lastName);
        productDescEdit.val(response.data.desc);
        productPriceEdit.val(response.data.price);
        btnSaveEdit.attr('id', id);
    } catch(e) {
        console.log(e);
    }
})

btnSaveEdit.on('click', async (e) => {
    let id = e.target.id
    let name = productNameEdit.val();
    let price = productPriceEdit.val();
    let lastName = productImageEdit.val();
    let desc = productDescEdit.val();
     let product = {
         name, 
         price,
         desc,
         lastName
     };
     try{
        await axios.patch(`${secondApi}/${id}`, product);
        modal.modal("hide");
        let url = `http://localhost:8050/contactbook?page_=${currentPage}&_limit=3`
        render(url);
     } catch(e) {
         console.log(e);
     }
});


// ! DELETE
$(document).on('click', '.delete-btn', async (e) => {
     let id = e.target.id
     await axios.delete(`${secondApi}/${id}`);
     render(API);
});
// const { data } = require("cypress/types/jquery");

// --- do not touch  ↓↓↓↓↓↓↓↓↓↓↓↓ ----------
const baseServerURL = `http://localhost:${import.meta.env.REACT_APP_JSON_SERVER_PORT
}`;
// --- do not touch  ↑↑↑↑↑↑↑↑↑↑↑↑ ----------

const recipeIngredientURL = `${baseServerURL}/recipeIngredients`;
const employeeURL = `${baseServerURL}/employees`;
const userRegisterURL = `${baseServerURL}/register`;
const userLoginURL = `${baseServerURL}/login`;

// let paginationWrapper = document.getElementById("pagination-wrapper");

// let loginUserUsername = document.getElementById("login-user-username");
// let loginUserPassword = document.getElementById("login-user-passowrd");

/*** BUTTONS ***/
let increadiantButton = document.getElementById("fetch-ingredient");
let loginUserButton = document.getElementById("login-user");
let getTodoButton = document.getElementById("fetch-todos");

let mainSection = document.getElementById("data-list-wrapper");

// let notificationWrapper = document.getElementById("notifications-wrapper");

// let userAuthToken = localStorage.getItem("localAccessToken") || null;
// let userId = +localStorage.getItem("userId") || null;
// const urlAllTodosOfUser = `${baseServerURL}/todos?userId=${userId}`;
// const urlTodosBase = `${baseServerURL}/todos/`;

/*** EVENT LISTNERS ***/
increadiantButton.addEventListener("click", () => {


fetch(recipeIngredientURL + `?_limit=40&`)
  .then((res) => {
    return res.json()
  })
  .then((res) => {
    console.log(res);
    let cardData=res.map(item=>{
      return{
        title:item.name,
        description:item.description ?item.description.substr(0,100):"No Description",
        imageURL:`${baseServerURL}${item.image}`,
        linkUrl:"https://www.google.com",
        linktext:"Read more",
      }
    })

    renderCards(cardData)
  //   mainSection.innerHTML = `
  //  <h2>List of Recipies</h2>
  //  <pre>
  //  <code>
  //  ${JSON.stringify(res, null, 2)}
  //  </code>
  //  </pre>    
  //  `

  })
  .catch((error) => {
    console.log(error);
  })
})



function renderCards(cardData) {
    let cardList=`
    <div class="card-list">
    ${cardData.map(item => getCard(item.title,item.description,item.imageURL,item.linktext,item.linkUrl)).join("")}
    </div>

    `
mainSection.innerHTML=cardList
}
function getCard(title,description,imageURL,linktext,linkUrl){
let card = `
<div class="card">
  <div class"card__img>
<img src=${imageURL} alt="food"/>
</div>
<div class="card__body">
<h3 class="card__item card__tittle>${title}</h3>
<div class="card__item card__description">
${description}
</div>
<a href=${linkUrl} class="card__item card__link">${linktext}</a>
</div>
</div>  
      `
  return card
}
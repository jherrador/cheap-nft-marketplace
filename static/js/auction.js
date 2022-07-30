// eslint-disable-next-line no-unused-vars
const addNewItem = async () => {
  console.log("lol");

  // eslint-disable-next-line no-undef
  await axios.post("/auction/new/0xfEEE476CFaf56c2f359A63500415d5a2c7F2F2B9/8459", {
  })
    .then((response) => {
      const { data } = response;
      console.log(data);
      const nftElement = `<li>
        <img src='${data.image}' alt='' style='width:200px;height:200px'/>
        <h1>${data.name}</h1>
        <p>${data.description}</p>
        <p>${data.address}</p>
        <p>${data.price}</p>
        <p>${data.lastUpdate}</p>
        <button>Approve 1</button>
        <button>Buy 2</button>
        <button>Transfer 3</button>
        </li>`;

      document.getElementById("listed_nfts").innerHTML += nftElement;
    })
    .catch((error) => {
      console.log("auction.addNewItem: Cannot add new nft to the auction", error);
    });
};

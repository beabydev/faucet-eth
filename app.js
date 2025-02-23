let notifyTimeout;
function notifyAction(text, color, time) {
  const notify = document.querySelector(".notify");
  if (notifyTimeout) clearTimeout(notifyTimeout);
  notify.style.display = "flex";
  notify.style.color = color;
  notify.style.border = `1px solid ${color}`;
  notify.innerHTML = text;
  if (time > 0) {
    notifyTimeout = setTimeout(() => {
      notify.style.display = "none";
    }, time);
  }
}

document.getElementById("dev-wallet").addEventListener("click", function () {
  const textToCopy = document.getElementById("dev-wallet").innerText;
  navigator.clipboard
    .writeText(textToCopy)
    .then(() => {
      console.log("copied: ", textToCopy);
      notifyAction("Copied to clipboard", "#00d300", 2000);
    })
    .catch((err) => {
      console.error("copy error ", err);
      notifyAction("Failed to copy", "red", 2000);
    });
});

document.getElementById("ethForm").addEventListener("submit", function (event) {
  event.preventDefault();
  const submitButton = event.target.querySelector("button[type='submit']");
  submitButton.disabled = true;
  notifyAction("Submitting...", "#00d300", 0);

  const userWallet = document.querySelector("#wallet").value;
  if (userWallet.length !== 42 || !/^0x[a-fA-F0-9]{40}$/.test(userWallet)) {
    notifyAction("Invalid wallet address", "red", 2000);
    submitButton.disabled = false;
    return;
  }

  const wallet = document.getElementById("wallet").value;
  const network = document.getElementById("network").value;
  const validNetworks = ["sETH", "hETH", "bETH", "oETH", "aETH"];
  if (!validNetworks.includes(network)) {
    notifyAction("Invalid network selected", "red", 2000);
    submitButton.disabled = false;
    return;
  }

  let quantity = { sETH: 0.1, hETH: 1, bETH: 0.1, oETH: 0.1, aETH: 0.5 };
  const data = { wallet, network, quantity: quantity[network] };

  fetch("http://localhost:8000/api/req-coin-testnet-faucet", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      return response.json();
    })
    .then((data) => {
      console.log("Success:", data);
      setTimeout(() => {
        let color = data.code === 0 ? "#00d300" : "red";
        notifyAction(data.msg || "No message", color, 4000);
        submitButton.disabled = false;
      }, 2500);
    })
    .catch((error) => {
      console.error("Error:", error);
      notifyAction("Request failed, try again!", "red", 4000);
      submitButton.disabled = false;
    });
});

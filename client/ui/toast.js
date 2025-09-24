export default function toast({ error, success, ms = 2000 } = {}) {
  const errorMsg = document.getElementById("error");
  const successMsg = document.getElementById("success");

  //reset
  errorMsg && ((errorMsg.style.display = "none"), (errorMsg.textContent = ""));
  successMsg &&
    ((successMsg.style.display = "none"), (successMsg.textContent = ""));

  if (error && errorMsg) {
    errorMsg.textContent = error;
    errorMsg.style.display = "block";
    setTimeout(() => {
      errorMsg.style.display = "none";
    }, ms);
  }

  if (success && successMsg) {
    successMsg.textContent = success;
    successMsg.style.display = "block";
    setTimeout(() => {
      successMsg.style.display = "none";
    }, ms);
  }
}

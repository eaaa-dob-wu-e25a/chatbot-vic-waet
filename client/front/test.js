let charCount = document.getElementById("charCount");
let userInput = document.getElementById("userInput");
let count = 0;
const maxCount = 250;
const countString = " " + "/ " + maxCount;

if (userInput && charCount) {
  userInput.addEventListener("input", () => {
    let length = userInput.value.length;

    charCount.innerText = userInput
      ? length + countString
      : count + countString;
    if (length >= maxCount) {
      charCount.classList.add("exceed");
      userInput.classList.add("exceed");
      userInput = null;
    } else {
      charCount.classList.remove("exceed");
      userInput.classList.remove("exceed");
    }
  });
}

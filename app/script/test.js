let charCount = document.getElementById('charCount');
let userInput = document.getElementById('userInput');

charCount.innerText = userInput ? userInput.value.length : 0;   

if (userInput && charCount) {
    userInput.addEventListener('input', () => {
        let length = userInput.value.length;
        charCount.innerText = length;
        if (length >= 250) {
            charCount.classList.add('exceed');
            userInput.classList.add('exceed');
        } else {
            charCount.classList.remove('exceed');
            userInput.classList.remove('exceed');   
        }
    });
}




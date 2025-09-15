const RESPONSES = [
  {
    label: "greetings",
    keywords: [
      "hi",
      "hello",
      "hey",
      "yo",
      "hej",
      "good morning",
      "good evening",
      "goddag",
      "godmorgen",
    ],
    answers: [
      "Hello! 👋",
      "Hey! What’s on your mind?",
      "Hi there — ready when you are.",
      "Yo - what's up?",
      "Hello! What can I do for you?",
    ],
  },
  {
    label: "goodbye",
    keywords: ["bye", "goodbye", "see you", "later", "farvel", "vi ses"],
    answers: ["Bye! 👋", "Catch you later.", "Take care!"],
  },
  {
    label: "smalltalk_howareyou",
    keywords: ["how are you", "hows it going", "what's up", "hvordan går det"],
    answers: [
      "I’m all code and coffee, but feeling great!",
      "Running smoothly. You?",
      "Here and ready to help.",
    ],
  },
  {
    label: "joke",
    keywords: ["joke", "make me laugh", "funny", "fortæl en joke"],
    answers: [
      "I would tell you a UDP joke, but you might not get it.",
      "Why did the dev go broke? Because he used up all his cache.",
      "There are 10 kinds of people: those who understand binary and those who don’t.",
    ],
  },
  {
    label: "time",
    keywords: ["time", "what time is it", "clock"],
    answers: [
      "I don’t have a watch, but your OS does 😉",
      "Time flies when you’re chatting with bots!",
      "It’s always now.",
    ],
  },
  {
    label: "thanks",
    keywords: ["thanks", "thank you", "tak", "appreciate it"],
    answers: ["Anytime!", "You got it.", "Happy to help."],
  },
  {
    label: "fallback",
    keywords: [],
    answers: [
      "Unfortunately, I don't have an answer for that. Try rephrasing 🙂",
      "I’m not sure I follow. Could you try another way?",
      "Hmm, that one’s new to me. Want to ask something simpler?",
    ],
  },
];

export default RESPONSES;

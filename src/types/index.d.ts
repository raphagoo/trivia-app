type tagState = {
    status: object;
    all: Array
}

type quizzState = {
    generated: Array
    active: Question
}

type Question = {
    category: String,
    id: String,
    tags: Array,
    difficulty: String,
    question: Object,
    correctAnswer: String,
    incorrectAnswer: Array,
    type: String
}
